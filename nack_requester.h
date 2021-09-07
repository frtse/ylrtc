#pragma once

#include <cstdint>

#include <map>
#include <set>
#include <vector>
#include <optional>
#include <memory>

#include "boost/asio.hpp"
#include "sequence_number_util.h"
#include "timer.h"

class NackRequester : public Timer::Listener, public std::enable_shared_from_this<NackRequester> {
 public:
  class Observer
  {
   public:
    virtual void OnNackRequesterRequestNack(const std::vector<uint16_t>& nack_list) = 0;
    virtual void OnNackRequesterRequestKeyFrame() = 0;
  };

  NackRequester(boost::asio::io_context& io_context, Observer* observer);
  void Init();

  int OnReceivedPacket(uint16_t seq_num, bool is_keyframe);
  int OnReceivedPacket(uint16_t seq_num, bool is_keyframe, bool is_recovered);

  void ClearUpTo(uint16_t seq_num);
  void UpdateRtt(int64_t rtt_ms);

 private:
  // Which fields to consider when deciding which packet to nack in
  // GetNackBatch.
  enum NackFilterOptions { kSeqNumOnly, kTimeOnly, kSeqNumAndTime };

  // This class holds the sequence number of the packet that is in the nack list
  // as well as the meta data about when it should be nacked and how many times
  // we have tried to nack this packet.
  struct NackInfo {
    NackInfo();
    NackInfo(uint16_t seq_num,
             uint16_t send_at_seq_num,
             int64_t created_at_time);

    uint16_t seq_num;
    uint16_t send_at_seq_num;
    int64_t created_at_time;
    int64_t sent_at_time;
    int retries;
  };

  struct BackoffSettings {
    // Matches magic number in RTPSender::OnReceivedNack().
    static constexpr int64_t kDefaultMinRetryInterval = 5; // Millis
    // Upper bound on link-delay considered for exponential backoff.
    // Selected so that cumulative delay with 1.25 base and 10 retries ends up
    // below 3s, since above that there will be a FIR generated instead.
    static constexpr int64_t kDefaultMaxRtt = 160; // Millis
    // Default base for exponential backoff, adds 25% RTT delay for each retry.
    static constexpr double kDefaultBase = 1.25;

    // Min time between nacks.
    const int64_t min_retry_interval{kDefaultMinRetryInterval};
    // Upper bound on link-delay considered for exponential backoff.
    const int64_t max_rtt{kDefaultMaxRtt};
    // Base for the exponential backoff.
    const double base{kDefaultBase};
  };

  void OnTimerTimeout() override;

  void AddPacketsToNack(uint16_t seq_num_start, uint16_t seq_num_end);

  // Removes packets from the nack list until the next keyframe. Returns true
  // if packets were removed.
  bool RemovePacketsUntilKeyFrame();
  std::vector<uint16_t> GetNackBatch(NackFilterOptions options);

  // Update the reordering distribution.
  void UpdateReorderingStatistics(uint16_t seq_num);

  // Returns how many packets we have to wait in order to receive the packet
  // with probability `probabilty` or higher.
  int WaitNumberOfPackets(float probability) const;

  std::map<uint16_t, NackInfo, DescendingSeqNumComp<uint16_t>> nack_list_;
  std::set<uint16_t, DescendingSeqNumComp<uint16_t>> keyframe_list_;
  std::set<uint16_t, DescendingSeqNumComp<uint16_t>> recovered_list_;
  boost::asio::io_context& io_context_;
  std::shared_ptr<Timer> timer_;
  Observer* observer_;
  bool initialized_;
  int64_t rtt_ms_;
  uint16_t newest_seq_num_;

  // Adds a delay before send nack on packet received.
  const int64_t send_nack_delay_ms_;
  const std::optional<BackoffSettings> backoff_settings_;
};