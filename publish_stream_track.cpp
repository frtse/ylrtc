#include "publish_stream_track.h"

#include <cstring>

#include "byte_buffer.h"
#include "rtcp_packet.h"
#include "rtp_utils.h"
#include "spdlog/spdlog.h"
#include "utils.h"

PublishStreamTrack::PublishStreamTrack(const Configuration& configuration
  , boost::asio::io_context& io_context, ReceiveSideTWCC& bwe, Observer* observer)
  : configuration_{configuration}
  , receive_statistician_{configuration_.ssrc, configuration_.clock_rate}
  , io_context_{io_context}
  , receive_side_twcc_{bwe}
  , observer_{observer} {
  if (configuration_.nack_enabled) {
    nack_request_.reset(new NackRequester(io_context, this));
    nack_request_->Init();
  }
  report_interval_ = configuration_.audio ? kDefaultAudioReportInterval : kDefaultVideoReportInterval;
}

void PublishStreamTrack::Init() {
  rtcp_timer_.reset(new Timer(io_context_, shared_from_this()));
  rtcp_timer_->AsyncWait(report_interval_);
}

void PublishStreamTrack::ReceiveRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) {
  uint32_t original_ssrc = rtp_packet->Ssrc();
  bool is_rtx = false;
  if (configuration_.rtx_enabled && configuration_.rtx_ssrc == rtp_packet->Ssrc()) {
    rtp_packet->RtxRepaire(LoadUInt16BE(rtp_packet->Payload()), configuration_.payload_type, configuration_.ssrc);
    is_rtx = true;
  }

  receive_statistician_.ReceivePacket(rtp_packet); // TODO: Separate RTX.
  if (!rtp_packet->ParsePayload(configuration_.codec))
    return;
  if (rtp_packet->IsKeyFrame())
    spdlog::debug("Recv key frame.");
  // TODO : Move this to PublishStream.
  uint32_t id = ServerSupportRtpExtensionIdMap::GetIdByType(RTPHeaderExtensionType::kRtpExtensionTransportSequenceNumber);
  auto twsn = rtp_packet->GetExtension<TransportSequenceNumberExtension>(id);
  if (twsn)
    receive_side_twcc_.IncomingPacket(TimeMillis(), original_ssrc, *twsn);
  if (configuration_.nack_enabled) {
    if (is_rtx)
      nack_request_->OnReceivedPacket(rtp_packet->SequenceNumber(), rtp_packet->IsKeyFrame(), true);
    else
      nack_request_->OnReceivedPacket(rtp_packet->SequenceNumber(), rtp_packet->IsKeyFrame());
  }

  if (!configuration_.rid.empty())
    rtp_packet->SetSsrc(kSimulcastSubscribeVideoSsrc);
  if (observer_)
    observer_->OnPublishStreamTrackReceiveRtpPacket(rtp_packet);
}

PublishStreamTrack::Configuration& PublishStreamTrack::Config() {
  return configuration_;
}

void PublishStreamTrack::OnNackRequesterRequestNack(const std::vector<uint16_t>& nack_list) {
  NackPacket nack;
  nack.SetSenderSsrc(configuration_.ssrc);
  nack.SetMediaSsrc(configuration_.ssrc);
  nack.SetLostPacketSequenceNumbers(nack_list);
  uint8_t buffer[1500];
  ByteWriter byte_write(buffer, 1500);
  nack.Serialize(&byte_write);
  if (observer_)
    observer_->OnPublishStreamTrackSendRtcpPacket(byte_write.Data(), byte_write.Used());
}

void PublishStreamTrack::OnNackRequesterRequestKeyFrame() {
  RtcpFirPacket fir;
  fir.SetSenderSsrc(configuration_.ssrc);
  fir.AddFciEntry(configuration_.ssrc, 111);
  uint8_t buffer[1500];
  ByteWriter byte_write(buffer, 1500);
  fir.Serialize(&byte_write);
  if (observer_)
    observer_->OnPublishStreamTrackSendRtcpPacket(byte_write.Data(), byte_write.Used());
}

void PublishStreamTrack::OnTimerTimeout() {
  ReceiverReportPacket rr;
  std::vector<ReportBlock> report_blocks;
  receive_statistician_.MaybeAppendReportBlockAndReset(report_blocks);
  if (!report_blocks.empty()) {
    rr.SetReportBlocks(std::move(report_blocks));
    uint8_t buffer[1500];
    ByteWriter byte_write(buffer, 1500);
    if (rr.Serialize(&byte_write)) {
      if (observer_)
        observer_->OnPublishStreamTrackSendRtcpPacket(byte_write.Data(), byte_write.Used());
    }
  }
  // generate next time to send an RTCP report
  int64_t min_interval = report_interval_;

  if (!configuration_.audio) {
    // Calculate bandwidth for video; 360 / send bandwidth in kbit/s.
    auto rate = receive_statistician_.BitrateReceived();
    if (rate) {
      int64_t send_bitrate_kbit = rate / 1000;
      if (send_bitrate_kbit != 0) {
        const int64_t millisecs_per_sec = 1000;
        min_interval = std::min(360 * millisecs_per_sec / send_bitrate_kbit, report_interval_);
      }
    }
  }

  // The interval between RTCP packets is varied randomly over the
  // range [1/2,3/2] times the calculated interval.
  int64_t time_to_next = random_.RandomNumber(min_interval * 1 / 2, min_interval * 3 / 2);
  rtcp_timer_->AsyncWait(time_to_next);
}

void PublishStreamTrack::SendRequestkeyFrame() {
  uint8_t buffer[1500];
  ByteWriter byte_write(buffer, 1500);
  if (configuration_.rtcpfb_pli) {
    RtcpPliPacket pli;
    pli.SetSenderSsrc(configuration_.ssrc);
    pli.SetMediaSsrc(configuration_.ssrc);
    pli.Serialize(&byte_write);
  }
  else if (configuration_.rtcpfb_fir) {
    RtcpFirPacket fir;
    fir.SetSenderSsrc(configuration_.ssrc);
    fir.AddFciEntry(configuration_.ssrc, fir_seq_num_++);
    fir.Serialize(&byte_write);
  }
  else {
    return;
  }
  if (observer_)
    observer_->OnPublishStreamTrackSendRtcpPacket(byte_write.Data(), byte_write.Used());
}