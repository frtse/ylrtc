#pragma once

#include <cstdint>
#include <memory>

#include "boost/asio.hpp"
#include "rtp_packet.h"
#include "rtp_packet_history.h"
#include "rtcp_packet.h"
#include "timer.h"

class SubscribeStreamTrack : public Timer::Listener {
 public:
  struct Configuration {
    uint32_t ssrc;
    uint8_t payload_type;
    uint32_t rtx_ssrc{0};
    uint8_t rtx_payload_type{0};
    bool rtx_enabled{false};
    bool nack_enabled{false};
    uint32_t clock_rate{0};
  };

  class Observer {
   public:
    virtual void OnSubscribeStreamTrackResendRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) = 0;
    virtual void OnSubscribeStreamTrackSendRtxPacket(std::shared_ptr<RtpPacket> rtp_packet
      , uint8_t payload_type, uint32_t ssrc, uint16_t sequence_number) = 0;
    virtual void OnSubscribeStreamTrackSendRtcpPacket(uint8_t* data, size_t size) = 0;
  };

  SubscribeStreamTrack(const Configuration& configuration, boost::asio::io_context& io_context, Observer* observer);

  void SendRtpPacket(std::shared_ptr<RtpPacket> rtp_packet);
  void ReceiveNack(NackPacket* nack_packet);
  void ReceiveReceiverReport(const ReportBlock& report_block);

 private:
  std::unique_ptr<SenderReportPacket> BuildSr();
  void OnTimerTimeout() override;
  Configuration configuration_;
  boost::asio::io_context& io_context_;
  Timer rtcp_timer_;
  uint16_t rtx_sequence_number_{0};
  Observer* observer_;
  RtpPacketHistory rtp_packet_history_;
  uint32_t packets_sent_{0};
  size_t media_bytes_sent_{0};
  uint32_t last_rtp_timestamp_{0};
  int64_t last_send_timestamp_{-1};
  int64_t rtt_millis_{100};
};