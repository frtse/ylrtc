#pragma once

#include <cstdint>
#include <memory>
#include <string>

#include "boost/asio.hpp"
#include "rtp_packet.h"
#include "nack_requester.h"
#include "threads.h"

class PublishStreamTrack : public NackRequester::Observer {
 public:
  struct Configuration {
    uint32_t ssrc;
    uint8_t payload_type;
    uint32_t rtx_ssrc{0};
    uint8_t rtx_payload_type{0};
    bool rtx_enabled{false};
    bool nack_enabled{false};
    std::string codec;
  };

  class Observer {
   public:
    virtual void OnPublishStreamTrackReceiveRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) = 0;
    virtual void OnPublishStreamTrackSendRtcpPacket(uint8_t* data, size_t size) = 0;
  };

  PublishStreamTrack(const Configuration& configuration, boost::asio::io_context& io_context, Observer* observer);
  void ReceiveRtpPacket(uint8_t* data, size_t length);

 private:
  void OnNackRequesterRequestNack(const std::vector<uint16_t>& nack_list) override;
  void OnNackRequesterRequestKeyFrame() override;
  Configuration configuration_;
  boost::asio::io_context& io_context_;
  std::unique_ptr<NackRequester> nack_request_;
  Observer* observer_;
};