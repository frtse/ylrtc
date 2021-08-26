#pragma once

#include <cstdint>
#include <unordered_map>
#include <vector>

#include "publish_stream.h"
#include "rtp_packet.h"
#include "webrtc_stream.h"
#include "subscribe_stream_track.h"

class SubscribeStream : public WebrtcStream, public PublishStream::DataObserver, public SubscribeStreamTrack::Observer {
 public:
  SubscribeStream(const std::string& stream_id, WebrtcStream::Observer* observer);
  ~SubscribeStream();
  void SetPublishSdp(const Sdp& publish_sdp);
  bool SetRemoteDescription(const std::string& offer) override;
  std::string CreateAnswer() override;
  void SetLocalDescription() override;

 private:
  void OnRtpPacketReceive(uint8_t* data, size_t length) override;
  void OnRtcpPacketReceive(uint8_t* data, size_t length) override;
  void OnPublishStreamRtpPacketReceive(std::shared_ptr<RtpPacket> rtp_packet) override;
  void OnSubscribeStreamTrackResendRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) override;
  void OnSubscribeStreamTrackSendRtxPacket(std::shared_ptr<RtpPacket> rtp_packet
    , uint8_t payload_type, uint32_t ssrc, uint16_t sequence_number) override;
  void SendRtx(std::shared_ptr<RtpPacket> rtp_packet, uint8_t payload_type, uint32_t ssrc, uint16_t sequence_number);
  std::vector<SubscribeStreamTrack*> tracks_;
  std::unordered_map<uint32_t, SubscribeStreamTrack*> ssrc_track_map_;
};