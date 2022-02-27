#pragma once

#include <list>
#include <memory>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

#include "publish_stream_track.h"
#include "receive_side_twcc.h"
#include "rtp_header_extension.h"
#include "rtp_packet.h"
#include "webrtc_stream.h"
#include "subscribe_stream.h"

class PublishStream : public WebrtcStream
  , public PublishStreamTrack::Observer
  , public ReceiveSideTWCC::Observer
  , public SubscribeStreamObserver {
 public:
  PublishStream(const std::string& room_id, const std::string& stream_id, std::weak_ptr<WebrtcStream::Observer> observer);
  ~PublishStream();
  void Init();
  bool SetRemoteDescription(const std::string& offer) override;
  std::optional<std::string> CreateAnswer() override;
  void SetLocalDescription() override;

  void RegisterDataObserver(std::shared_ptr<SubscribeStream> observer);
  void UnregisterDataObserver(std::shared_ptr<SubscribeStream> observer);
  void UpdateMuteInfo(const std::string& type, bool muted);
  bool HasVideo() const;
  bool HasAudio() const;
  void Stop() override;

 private:
  void OnRtpPacketReceive(uint8_t* data, size_t length) override;
  void OnRtcpPacketReceive(uint8_t* data, size_t length) override;
  void OnPublishStreamTrackSendRtcpPacket(RtcpPacket& rtcp_packet) override;
  void OnReceiveSideTwccSendTransportFeedback(std::unique_ptr<RtcpPacket> packet) override;
  void OnSubscribeStreamFrameRequested(const std::string& rid = "") override;

  std::list<std::shared_ptr<SubscribeStream>> data_observers_;
  std::vector<std::shared_ptr<PublishStreamTrack>> tracks_;
  std::unordered_map<uint32_t, std::shared_ptr<PublishStreamTrack>> ssrc_track_map_;
  std::shared_ptr<ReceiveSideTWCC> receive_side_twcc_;
  std::unordered_map<std::string, PublishStreamTrack::Configuration> rid_configuration_map_;
  std::unordered_map<std::string, RtpHeaderExtensionCapability> section_type_extensions_map_;
  std::vector<RtpHeaderExtensionCapability> extension_capabilities_;
  // Stream mute info.
  bool has_video_;
  bool has_audio_;
};