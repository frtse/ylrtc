#pragma once

#include <cstdint>
#include <memory>

#include "rtp_packet.h"

class PublishStreamTrack {
 public:
  struct Configuration {
    uint32_t ssrc;
    uint8_t payload_type;
    uint32_t rtx_ssrc{0};
    uint8_t rtx_payload_type{0};
    bool rtx_enabled{false};
    bool nack_enabled{false};
  };

  class Observer {
   public:
    virtual void OnPublishStreamTrackReceiveRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) = 0;
  };

  PublishStreamTrack(const Configuration& configuration, Observer* observer);
  void ReceiveRtpPacket(uint8_t* data, size_t length);

 private:
  Configuration configuration_;
  Observer* observer_;
};