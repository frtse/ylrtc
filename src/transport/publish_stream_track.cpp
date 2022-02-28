#include "publish_stream_track.h"

#include <cstring>

#include "byte_buffer.h"
#include "rtcp_packet.h"
#include "rtp_utils.h"
#include "spdlog/spdlog.h"
#include "utils.h"

PublishStreamTrack::PublishStreamTrack(const Configuration& configuration, boost::asio::io_context& io_context, Observer* observer)
    : configuration_{configuration},
      track_statistics_{configuration_.ssrc, configuration_.clock_rate},
      io_context_{io_context},
      observer_{observer} {
  if (configuration_.nack_enabled) {
    nack_request_.reset(new NackRequester(io_context, this));
    nack_request_->Init();
  }

  if (configuration_.rtx_enabled) {
    if (configuration_.rtx_ssrc)
    rtx_track_statistics_.reset(new TrackStatistics(*configuration_.rtx_ssrc, configuration_.rtx_payload_type));
  } else
    track_statistics_.EnableRetransmitDetection(true);
  report_interval_ = configuration_.audio ? kDefaultAudioReportIntervalMillis : kDefaultVideoReportIntervalMillis;
}

void PublishStreamTrack::Init() {
  rtcp_timer_.reset(new Timer(io_context_, shared_from_this()));
  rtcp_timer_->AsyncWait(report_interval_);
}

void PublishStreamTrack::Deinit() {
  if (rtcp_timer_)
    rtcp_timer_->Stop();
  if (nack_request_)
    nack_request_->Deinit();
}

void PublishStreamTrack::ReceiveRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) {
  bool is_rtx = false;
  if (configuration_.rtx_enabled && configuration_.rtx_ssrc && *configuration_.rtx_ssrc == rtp_packet->Ssrc()) {
    if (rtx_track_statistics_)
      rtx_track_statistics_->ReceivePacket(rtp_packet);
    rtp_packet->RtxRepaire(LoadUInt16BE(rtp_packet->Payload()), configuration_.payload_type, configuration_.ssrc);
    is_rtx = true;
  }
  if (!is_rtx)
    track_statistics_.ReceivePacket(rtp_packet);
  if (!configuration_.audio && !rtp_packet->ParsePayload(configuration_.codec))
    return;
  if (configuration_.nack_enabled) {
    if (is_rtx)
      nack_request_->OnReceivedPacket(rtp_packet->SequenceNumber(), rtp_packet->IsKeyFrame(), true);
    else
      nack_request_->OnReceivedPacket(rtp_packet->SequenceNumber(), rtp_packet->IsKeyFrame());
  }

  if (!configuration_.rid.empty())
    rtp_packet->SetSsrc(kSimulcastSubscribeVideoSsrc);
}

PublishStreamTrack::Configuration& PublishStreamTrack::Config() {
  return configuration_;
}

void PublishStreamTrack::SetRtxSSRC(uint32_t ssrc) {
  if (configuration_.rtx_enabled) {
    configuration_.rtx_ssrc = ssrc;
    rtx_track_statistics_.reset(new TrackStatistics(ssrc, configuration_.rtx_payload_type));
  }
}

void PublishStreamTrack::OnNackRequesterRequestNack(const std::vector<uint16_t>& nack_list) {
  NackPacket nack;
  nack.SetSenderSsrc(configuration_.ssrc);
  nack.SetMediaSsrc(configuration_.ssrc);
  nack.SetLostPacketSequenceNumbers(nack_list);
  if (observer_)
    observer_->OnPublishStreamTrackSendRtcpPacket(nack);
}

void PublishStreamTrack::OnNackRequesterRequestKeyFrame() {
  RtcpFirPacket fir;
  fir.SetSenderSsrc(configuration_.ssrc);
  fir.AddFciEntry(configuration_.ssrc, 111); // TODO 111?
  if (observer_)
    observer_->OnPublishStreamTrackSendRtcpPacket(fir);
}

void PublishStreamTrack::OnTimerTimeout() {
  ReceiverReportPacket rr;
  std::vector<ReportBlock> report_blocks;
  track_statistics_.MaybeAppendReportBlockAndReset(report_blocks);
  if (rtx_track_statistics_)
    rtx_track_statistics_->MaybeAppendReportBlockAndReset(report_blocks);
  if (!report_blocks.empty()) {
    rr.SetReportBlocks(std::move(report_blocks));
    if (observer_)
      observer_->OnPublishStreamTrackSendRtcpPacket(rr);
  }

  XrPacket xr;
  RrtrBlockContext rrtr_contex;
  rrtr_contex.SetNtp(NtpTime::CreateFromMillis(TimeMillis()));
  xr.SetRrtr(rrtr_contex);
  xr.SetSenderSsrc(configuration_.ssrc);
  if (observer_)
    observer_->OnPublishStreamTrackSendRtcpPacket(xr);
  // generate next time to send an RTCP report
  int64_t min_interval = report_interval_;

  if (!configuration_.audio) {
    // Calculate bandwidth for video; 360 / send bandwidth in kbit/s.
    auto rate = track_statistics_.BitrateReceived();
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
  spdlog::debug("PublishStreamTrack::SendRequestkeyFrame");
  if (configuration_.rtcpfb_pli) {
    RtcpPliPacket pli;
    pli.SetSenderSsrc(configuration_.ssrc);
    pli.SetMediaSsrc(configuration_.ssrc);
    if (observer_)
      observer_->OnPublishStreamTrackSendRtcpPacket(pli);
  } else if (configuration_.rtcpfb_fir) {
    RtcpFirPacket fir;
    fir.SetSenderSsrc(configuration_.ssrc);
    fir.AddFciEntry(configuration_.ssrc, fir_seq_num_++);
    if (observer_)
      observer_->OnPublishStreamTrackSendRtcpPacket(fir);
  } else {
    return;
  }
}

void PublishStreamTrack::ReceiveDlrrSubBlock(const ReceiveTimeInfo& sub_block) {
  if (sub_block.ssrc == configuration_.ssrc) {
    uint64_t now = TimeMillis();
    NtpTime ntp = NtpTime::CreateFromMillis(now);
    uint32_t compact_ntp = ntp.ToCompactNtp();
    if (sub_block.last_rr && compact_ntp > sub_block.last_rr + sub_block.delay_since_last_rr) {
      uint32_t rtp_compact_ntp = compact_ntp - sub_block.delay_since_last_rr - sub_block.last_rr;
      rtt_millis_ = NtpTime::CreateFromCompactNtp(rtp_compact_ntp).ToMillis();
      if (configuration_.nack_enabled)
        nack_request_->UpdateRtt(rtt_millis_);
    }
  }
}