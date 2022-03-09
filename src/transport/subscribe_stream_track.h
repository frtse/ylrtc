#pragma once

#include <cstdint>
#include <cstddef>
#include <memory>
#include <optional>

#include "boost/asio.hpp"
#include "random.h"
#include "bitrate_estimator.h"
#include "rtcp_packet.h"
#include "rtp_packet.h"
#include "send_packet_recorder.h"
#include "timer.h"

class SubscribeStreamTrack : public Timer::Observer, public std::enable_shared_from_this<SubscribeStreamTrack> {
 public:
  struct Configuration {
    uint32_t ssrc;
    uint8_t payload_type;
    uint32_t rtx_ssrc{0};
    uint8_t rtx_payload_type{0};
    bool rtx_enabled{false};
    bool nack_enabled{false};
    uint32_t clock_rate{0};
    bool audio{false};
    RtpHeaderExtensionCapability extension_capability;
  };

  class Observer {
   public:
    virtual void OnSubscribeStreamTrackResendRtpPacket(std::unique_ptr<RtpPacket> rtp_packet) = 0;
    virtual void OnSubscribeStreamTrackSendRtxPacket(std::unique_ptr<RtpPacket> rtp_packet,
                                                     uint8_t payload_type,
                                                     uint32_t ssrc,
                                                     uint16_t sequence_number) = 0;
    virtual void OnSubscribeStreamTrackSendRtcpPacket(RtcpPacket& rtcp_packet) = 0;
    virtual void OnSubscribeStreamTrackSendRtpPacket(RtpPacket* packet) = 0;
  };

  SubscribeStreamTrack(const Configuration& configuration, boost::asio::io_context& io_context, Observer* observer);

  void Init();
  void Deinit();
  Configuration& Config();
  void SendRtpPacket(std::unique_ptr<RtpPacket> rtp_packet);
  void ReceiveNack(NackPacket* nack_packet);
  void ReceiveReceiverReport(const ReportBlock& report_block);
  void SyncSequenceNumber(uint16_t seq);

 private:
  std::optional<SenderReportPacket> BuildSr();
  void OnTimerTimeout() override;
  Configuration configuration_;
  boost::asio::io_context& io_context_;
  std::shared_ptr<Timer> rtcp_timer_;
  uint16_t rtx_sequence_number_{0};
  Observer* observer_;
  SendPacketRecorder send_packet_recorder_;
  uint32_t packets_sent_{0};
  size_t media_bytes_sent_{0};
  uint32_t last_rtp_timestamp_{0};
  int64_t last_send_timestamp_{-1};
  int64_t rtt_millis_{100};
  BitRateEstimator rate_statistics_;
  int64_t report_interval_;
  Random random_;
  uint16_t max_rtp_seq_{0};
  uint16_t base_rtp_seq_{0};
  bool first_packet_{true};
};