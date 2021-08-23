#include "subscribe_stream_track.h"

#include "spdlog/spdlog.h"
#include "utils.h"

SubscribeStreamTrack::SubscribeStreamTrack(const Configuration& configuration, Observer* observer)
  : configuration_{configuration}, observer_{observer} {}

void SubscribeStreamTrack::SendRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) {
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
    if (packet && observer_)
      observer_->OnSubscribeStreamTrackResendRtpPacket(packet);
  }
}
