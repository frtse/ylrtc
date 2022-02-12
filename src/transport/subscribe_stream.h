#pragma once

#include <cstdint>
#include <memory>
#include <unordered_map>
#include <vector>
#include <optional>

#include "publish_stream.h"
#include "rtp_packet.h"
#include "subscribe_stream_track.h"
#include "webrtc_stream.h"

class SubscribeStream : public WebrtcStream, public SubscribeStreamTrack::Observer {
 public:
  SubscribeStream(const std::string& room_id, const std::string& stream_id, std::shared_ptr<WebrtcStream::Observer> observer);
  ~SubscribeStream();
  void SetSdpNegotiator(const SdpNegotiator& publish_sdp);
  bool SetRemoteDescription(const std::string& offer) override;
  std::optional<std::string> CreateAnswer() override;
  void SetLocalDescription() override;
  void OnPublishStreamRtpPacketReceive(std::shared_ptr<RtpPacket> rtp_packet);

 private:
  void OnRtpPacketReceive(uint8_t* data, size_t length) override;
  void OnRtcpPacketReceive(uint8_t* data, size_t length) override;
  void OnSubscribeStreamTrackResendRtpPacket(std::unique_ptr<RtpPacket> rtp_packet) override;
  void OnSubscribeStreamTrackSendRtxPacket(std::unique_ptr<RtpPacket> rtp_packet,
                                           uint8_t payload_type,
                                           uint32_t ssrc,
                                           uint16_t sequence_number) override;
  void OnSubscribeStreamTrackSendRtcpPacket(RtcpPacket& rtcp_packet) override;
  std::vector<std::shared_ptr<SubscribeStreamTrack>> tracks_;
  std::unordered_map<uint32_t, std::shared_ptr<SubscribeStreamTrack>> ssrc_track_map_;
  uint64_t transport_seq_{0};
};