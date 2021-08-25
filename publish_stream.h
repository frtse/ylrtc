#pragma once

#include <unordered_map>
#include <vector>

#include "rtp_packet.h"
#include "webrtc_stream.h"
#include "publish_stream_track.h"

class PublishStream : public WebrtcStream {
 public:
  class DataObserver {
   public:
    virtual void OnPublishStreamRtpPacketReceive(std::shared_ptr<RtpPacket> rtp_packet) = 0;
  };

  PublishStream(const std::string& stream_id, Observer* observer);
  bool SetRemoteDescription(const std::string& offer) override;
  std::string CreateAnswer() override;
  void SetLocalDescription() override;

  void RegisterDataObserver(DataObserver* observer);
  void UnregisterDataObserver(DataObserver* observer);
  void SendRequestkeyFrame();

 private:
  std::list<DataObserver*> data_observers_;
  void OnRtpPacketReceive(uint8_t* data, size_t length) override;
  void OnRtcpPacketReceive(uint8_t* data, size_t length) override;
  std::vector<PublishStreamTrack*> tracks_;
  std::unordered_map<uint32_t, PublishStreamTrack*> ssrc_track_map_;
};
