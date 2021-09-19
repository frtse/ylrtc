#pragma once

#include <cstdint>
#include <memory>
#include <string>
#include <vector>
#include <unordered_map>

#include "boost/asio.hpp"
#include "nack_requester.h"
#include "rtp_header_extension.h"
#include "rtp_packet.h"
#include "threads.h"
#include "receive_side_twcc.h"

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
    std::string rid;
  };

  class Observer {
   public:
    virtual void OnPublishStreamTrackReceiveRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) = 0;
    virtual void OnPublishStreamTrackSendRtcpPacket(uint8_t* data, size_t size) = 0;
  };

  PublishStreamTrack(const Configuration& configuration, boost::asio::io_context& io_context, ReceiveSideTWCC& bwe, Observer* observer);
  void ReceiveRtpPacket(std::shared_ptr<RtpPacket> rtp_packet);
  Configuration& Config();

 private:
  void OnNackRequesterRequestNack(const std::vector<uint16_t>& nack_list) override;
  void OnNackRequesterRequestKeyFrame() override;
  Configuration configuration_;
  boost::asio::io_context& io_context_;
  std::shared_ptr<NackRequester> nack_request_;
  ReceiveSideTWCC& receive_side_twcc_;
  Observer* observer_;
};