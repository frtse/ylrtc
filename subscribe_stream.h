#pragma once

#include <cstdint>
#include <memory>
#include <unordered_map>
#include <vector>

#include "publish_stream.h"
#include "rtp_packet.h"
#include "subscribe_stream_track.h"
#include "webrtc_stream.h"

class SubscribeStream : public WebrtcStream, public SubscribeStreamTrack::Observer, public std::enable_shared_from_this<SubscribeStream> {
 public:
  SubscribeStream(const std::string& stream_id, WebrtcStream::Observer* observer);
  ~SubscribeStream();
  void SetPublishSdp(const Sdp& publish_sdp);
  bool SetRemoteDescription(const std::string& offer) override;
  std::string CreateAnswer() override;
  void SetLocalDescription() override;
  void OnPublishStreamRtpPacketReceive(std::shared_ptr<RtpPacket> rtp_packet);

 private:
  void OnRtpPacketReceive(uint8_t* data, size_t length) override;
  void OnRtcpPacketReceive(uint8_t* data, size_t length) override;
  void OnSubscribeStreamTrackResendRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) override;
  void OnSubscribeStreamTrackSendRtxPacket(std::shared_ptr<RtpPacket> rtp_packet, uint8_t payload_type, uint32_t ssrc, uint16_t sequence_number) override;
  void OnSubscribeStreamTrackSendRtcpPacket(uint8_t* data, size_t size) override;
  void SendRtx(std::shared_ptr<RtpPacket> rtp_packet, uint8_t payload_type, uint32_t ssrc, uint16_t sequence_number);
  std::vector<std::shared_ptr<SubscribeStreamTrack>> tracks_;
  std::unordered_map<uint32_t, std::shared_ptr<SubscribeStreamTrack>> ssrc_track_map_;
};