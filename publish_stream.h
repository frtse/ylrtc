#pragma once

#include <memory>
#include <unordered_map>
#include <vector>
#include <string>
#include <optional>

#include "publish_stream_track.h"
#include "rtp_packet.h"
#include "webrtc_stream.h"
#include "receive_side_twcc.h"

class SubscribeStream;
class PublishStream : public WebrtcStream, public PublishStreamTrack::Observer, public std::enable_shared_from_this<PublishStream> {
 public:
  PublishStream(const std::string& stream_id, WebrtcStream::Observer* observer);
  ~PublishStream();
  bool SetRemoteDescription(const std::string& offer) override;
  std::string CreateAnswer() override;
  void SetLocalDescription() override;

  void RegisterDataObserver(std::shared_ptr<SubscribeStream> observer);
  void UnregisterDataObserver(std::shared_ptr<SubscribeStream> observer);
  void SendRequestkeyFrame();

 private:
  void OnRtpPacketReceive(uint8_t* data, size_t length) override;
  void OnRtcpPacketReceive(uint8_t* data, size_t length) override;
  void OnPublishStreamTrackReceiveRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) override;
  void OnPublishStreamTrackSendRtcpPacket(uint8_t* data, size_t size) override;
  std::list<std::shared_ptr<SubscribeStream>> data_observers_;
  std::vector<std::shared_ptr<PublishStreamTrack>> tracks_;
  std::unordered_map<uint32_t, std::shared_ptr<PublishStreamTrack>> ssrc_track_map_;
  std::shared_ptr<ReceiveSideTWCC> receive_side_twcc_;
  std::unordered_map<std::string, std::vector<std::string>> mid_rids_map_;
  std::unordered_map<std::string, PublishStreamTrack::Configuration> rid_configuration_map_;
};
