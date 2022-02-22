#pragma once

#include <memory>
#include <optional>

#include "boost/asio.hpp"
#include "packet_arrival_map.h"
#include "rtcp_packet.h"
#include "sequence_number_util.h"
#include "timer.h"
#include "transport_feedback.h"

// Class used when send-side BWE is enabled: This proxy is instantiated on the
// receive side. It buffers a number of receive timestamps and then sends
// transport feedback messages back too the send side.
class ReceiveSideTWCC : public Timer::Observer, public std::enable_shared_from_this<ReceiveSideTWCC> {
 public:
  class Observer {
   public:
    virtual void OnReceiveSideTwccSendTransportFeedback(std::unique_ptr<RtcpPacket> packet) = 0;
  };
  ReceiveSideTWCC(boost::asio::io_context& io_context, std::weak_ptr<Observer> observer);

  void Init();
  void Deinit();
  void IncomingPacket(int64_t arrival_time_ms, uint32_t ssrc, uint16_t transport_sequence_number);

 private:
  int64_t TimeUntilNextProcess();
  void Process();
  void OnTimerTimeout() override;
  void MaybeCullOldPackets(int64_t sequence_number, int64_t arrival_time_ms);
  void SendPeriodicFeedbacks();

  // Returns a Transport Feedback packet with information about as many packets
  // that has been received between [`begin_sequence_number_incl`,
  // `end_sequence_number_excl`) that can fit in it. If `is_periodic_update`,
  // this represents sending a periodic feedback message, which will make it
  // update the `periodic_window_start_seq_` variable with the first packet that
  // was not included in the feedback packet, so that the next update can
  // continue from that sequence number.
  //
  // If no incoming packets were added, nullptr is returned.
  //
  // `include_timestamps` decide if the returned TransportFeedback should
  // include timestamps.
  std::unique_ptr<TransportFeedback> MaybeBuildFeedbackPacket(bool include_timestamps,
                                                              int64_t begin_sequence_number_inclusive,
                                                              int64_t end_sequence_number_exclusive,
                                                              bool is_periodic_update);

  static constexpr int64_t kSendIntervalMillis = 100;
  static constexpr int64_t kBackWindowMillis = 100;
  std::weak_ptr<Observer> observer_;
  int64_t last_process_time_millis_;
  uint32_t media_ssrc_;
  uint8_t feedback_packet_count_;
  SeqNumUnwrapper<uint16_t> unwrapper_;
  // The next sequence number that should be the start sequence number during
  // periodic reporting. Will be absl::nullopt before the first seen packet.
  std::optional<int64_t> periodic_window_start_seq_;
  PacketArrivalTimeMap packet_arrival_times_;
  boost::asio::io_context& io_context_;
  std::shared_ptr<Timer> timer_;
};