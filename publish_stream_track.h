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
#include "rtcp_packet.h"
#include "threads.h"
#include "receive_side_twcc.h"
#include "timer.h"
#include "receive_statistician.h"
#include "random.h"

class PublishStreamTrack : public Timer::Listener
  , public NackRequester::Observer
  , public std::enable_shared_from_this<PublishStreamTrack> {
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
    bool audio{false};
    bool rtcpfb_pli{false};
    bool rtcpfb_fir{false};
    uint32_t clock_rate{0};
  };

  class Observer {
   public:
    virtual void OnPublishStreamTrackSendRtcpPacket(uint8_t* data, size_t size) = 0;
  };

  PublishStreamTrack(const Configuration& configuration, boost::asio::io_context& io_context, ReceiveSideTWCC& bwe, Observer* observer);
  void ReceiveRtpPacket(std::shared_ptr<RtpPacket> rtp_packet);
  void Init();
  Configuration& Config();
  void SendRequestkeyFrame();
  void ReceiveDlrrSubBlock(const ReceiveTimeInfo& sub_block);

 private:
  void OnNackRequesterRequestNack(const std::vector<uint16_t>& nack_list) override;
  void OnNackRequesterRequestKeyFrame() override;
  void OnTimerTimeout() override;
  std::shared_ptr<Timer> rtcp_timer_;
  int64_t report_interval_;
  Configuration configuration_;
  ReceiveStatistician receive_statistician_;
  boost::asio::io_context& io_context_;
  std::shared_ptr<NackRequester> nack_request_;
  ReceiveSideTWCC& receive_side_twcc_;
  uint8_t fir_seq_num_{0};
  Random random_;
  int64_t rtt_millis_{100};
  Observer* observer_;
};