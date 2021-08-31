#include "subscribe_stream_track.h"

#include "spdlog/spdlog.h"
#include "utils.h"

SubscribeStreamTrack::SubscribeStreamTrack(const Configuration& configuration
  , boost::asio::io_context& io_context, Observer* observer)
  : configuration_{configuration}, io_context_{io_context}, rtcp_timer_{io_context_, this}, observer_{observer} {
  rtcp_timer_.AsyncWait(1000);
}

void SubscribeStreamTrack::SendRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) {
  packets_sent_++;
  media_bytes_sent_ += rtp_packet->Size();
  last_rtp_timestamp_ = rtp_packet->Timestamp();
  last_send_timestamp_ = TimeMillis();
  if (!configuration_.nack_enabled)
    return;
  rtp_packet_history_.PutRtpPacket(rtp_packet);
}

void SubscribeStreamTrack::ReceiveNack(NackPacket* nack_packet) {
  if (!configuration_.nack_enabled) {
    spdlog::warn("NACK packet are received in NACK disabled stream track.");
    return;
  }

  if (!nack_packet)
    return;
  auto& lost_packets = nack_packet->GetLostPacketSequenceNumbers();

  for (auto& seq_num : lost_packets) {
    auto packet = rtp_packet_history_.GetPacketAndSetSendTime(seq_num);
    if (!packet)
      continue;
    if (!configuration_.rtx_enabled)
        observer_->OnSubscribeStreamTrackResendRtpPacket(packet);
    else
        observer_->OnSubscribeStreamTrackSendRtxPacket(packet, configuration_.rtx_payload_type
          , configuration_.rtx_ssrc, rtx_sequence_number_++);
  }
}

void SubscribeStreamTrack::ReceiveReceiverReport(const ReportBlock& report_block) {
  uint64_t now = TimeMillis();
  NtpTime ntp = NtpTime::CreateFromMillis(now);
  uint32_t compact_ntp = ntp.ToCompactNtp();
  if (report_block.last_sr != 0) {
    uint32_t rtp_compact_ntp =
        compact_ntp - report_block.delay_since_last_sr - report_block.last_sr;
    rtt_millis_ = NtpTime::CreateFromCompactNtp(rtp_compact_ntp).ToMillis();
    rtp_packet_history_.SetRtt(rtt_millis_);
  }
}

std::unique_ptr<SenderReportPacket> SubscribeStreamTrack::BuildSr() {
  if (last_send_timestamp_ == -1)
    return nullptr;
  int now_millis = TimeMillis();
  auto ntp = NtpTime::CreateFromMillis(now_millis);
  auto sr = std::make_unique<SenderReportPacket>();
  auto diff_in_millis = now_millis - last_send_timestamp_;
  auto diff_in_clockrate = diff_in_millis * configuration_.clock_rate / 1000;
  sr->SetSenderSsrc(configuration_.ssrc);
  sr->SetNtpSeconds(ntp.Seconds());
  sr->SetNtpFractions(ntp.Fractions());
  sr->SetRtpTimestamp(last_rtp_timestamp_ + diff_in_clockrate);
  sr->SetSendPacketCount(packets_sent_);
  sr->SendOctets(media_bytes_sent_);
  return sr;
}

void SubscribeStreamTrack::OnTimerTimeout() {
  auto sr_packet = BuildSr();
  if (sr_packet) {
    uint8_t buffer[1500];
    ByteWriter byte_write(buffer, 1500);
    if (sr_packet->Serialize(&byte_write)) {
      observer_->OnSubscribeStreamTrackSendRtcpPacket(byte_write.Data(), byte_write.Used());
    }
  }
  rtcp_timer_.AsyncWait(1000);
}