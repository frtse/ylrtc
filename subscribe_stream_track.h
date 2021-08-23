#pragma once

#include <cstdint>
#include <memory>

#include "rtp_packet.h"
#include "rtp_packet_history.h"
#include "rtcp_packet.h"

class SubscribeStreamTrack {
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
    virtual void OnSubscribeStreamTrackResendRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) = 0;
  };

  SubscribeStreamTrack(const Configuration& configuration, Observer* observer);

  void SendRtpPacket(std::shared_ptr<RtpPacket> rtp_packet);
  void ReceiveNack(NackPacket* nack_packet);
 private:
  Configuration configuration_;
  Observer* observer_;
  RtpPacketHistory rtp_packet_history_; 
};