#include "inter_arrival_delta.h"

#include "utils.h"
#include "spdlog/spdlog.h"

static constexpr int64_t kBurstDeltaThresholdMillis = 5;
static constexpr int64_t kMaxBurstDurationMillis = 100;
// A send time group is defined as all packets with a send time which are at
// most send_time_group_length older than the first timestamp in that
// group.
static constexpr int64_t kDefaultSendTimeGroupLengthMillis = 5;
// After this many packet groups received out of order InterArrival will
// reset, assuming that clocks have made a jump.
static constexpr int kReorderedResetThreshold = 3;
static constexpr int64_t kArrivalTimeOffsetThresholdMillis = 3000;

InterArrivalDelta::InterArrivalDelta()
    : send_time_group_length_millis_(kDefaultSendTimeGroupLengthMillis),
      current_timestamp_group_(),
      prev_timestamp_group_(),
      num_consecutive_reordered_packets_(0) {}

bool InterArrivalDelta::ComputeDeltas(int64_t send_time_millis,
                                      int64_t arrival_time_millis,
                                      int64_t system_time_millis,
                                      size_t packet_size,
                                      int64_t* send_time_delta_millis,
                                      int64_t* arrival_time_delta_millis,
                                      int* packet_size_delta) {
  bool calculated_deltas = false;
  if (current_timestamp_group_.IsFirstPacket()) {
    // We don't have enough data to update the filter, so we store it until we
    // have two frames of data to process.
    current_timestamp_group_.send_time_millis = send_time_millis;
    current_timestamp_group_.first_send_time_millis = send_time_millis;
    current_timestamp_group_.first_arrival_millis = arrival_time_millis;
  } else if (current_timestamp_group_.first_send_time_millis > send_time_millis) {
    // Reordered packet.
    return false;
  } else if (NewTimestampGroup(arrival_time_millis, send_time_millis)) {
    // First packet of a later send burst, the previous packets sample is ready.
    if (prev_timestamp_group_.complete_time_millis >= 0) {
      *send_time_delta_millis =
          current_timestamp_group_.send_time_millis - prev_timestamp_group_.send_time_millis;
      *arrival_time_delta_millis = current_timestamp_group_.complete_time_millis -
                            prev_timestamp_group_.complete_time_millis;

      int64_t system_time_delta = current_timestamp_group_.last_system_time_millis -
                                    prev_timestamp_group_.last_system_time_millis;

      if (*arrival_time_delta_millis - system_time_delta >=
          kArrivalTimeOffsetThresholdMillis) {
        spdlog::warn("The arrival time clock offset has changed (diff = {} ms), resetting.", *arrival_time_delta_millis - system_time_delta);
        Reset();
        return false;
      }
      if (*arrival_time_delta_millis < 0) {
        // The group of packets has been reordered since receiving its local
        // arrival timestamp.
        ++num_consecutive_reordered_packets_;
        if (num_consecutive_reordered_packets_ >= kReorderedResetThreshold) {
          spdlog::warn("Packets between send burst arrived out of order, resetting."
            " arrival_time_delta_millis {}  send time delta {}", *arrival_time_delta_millis, *send_time_delta_millis);
          Reset();
        }
        return false;
      } else {
        num_consecutive_reordered_packets_ = 0;
      }
      *packet_size_delta = static_cast<int>(current_timestamp_group_.size) -
                           static_cast<int>(prev_timestamp_group_.size);
      calculated_deltas = true;
    }
    prev_timestamp_group_ = current_timestamp_group_;
    // The new timestamp is now the current frame.
    current_timestamp_group_.first_send_time_millis = send_time_millis;
    current_timestamp_group_.send_time_millis = send_time_millis;
    current_timestamp_group_.first_arrival_millis = arrival_time_millis;
    current_timestamp_group_.size = 0;
  } else {
    current_timestamp_group_.send_time_millis =
        std::max(current_timestamp_group_.send_time_millis, send_time_millis);
  }
  // Accumulate the frame size.
  current_timestamp_group_.size += packet_size;
  current_timestamp_group_.complete_time_millis = arrival_time_millis;
  current_timestamp_group_.last_system_time_millis = system_time_millis;

  return calculated_deltas;
}

// Assumes that `timestamp` is not reordered compared to
// `current_timestamp_group_`.
bool InterArrivalDelta::NewTimestampGroup(int64_t arrival_time_millis,
                                          int64_t send_time_millis) const {
  if (current_timestamp_group_.IsFirstPacket()) {
    return false;
  } else if (BelongsToBurst(arrival_time_millis, send_time_millis)) {
    return false;
  } else {
    return send_time_millis - current_timestamp_group_.first_send_time_millis >
           send_time_group_length_millis_;
  }
}

bool InterArrivalDelta::BelongsToBurst(int64_t arrival_time_millis,
                                       int64_t send_time_millis) const {
  DCHECK(current_timestamp_group_.complete_time_millis >= 0);
  int64_t arrival_time_delta_millis =
      arrival_time_millis - current_timestamp_group_.complete_time_millis;
  int64_t send_time_delta_millis = send_time_millis - current_timestamp_group_.send_time_millis;
  if (send_time_delta_millis == 0)
    return true;
  int64_t propagation_delta = arrival_time_delta_millis - send_time_delta_millis;
  if (propagation_delta < 0 &&
      arrival_time_delta_millis <= kBurstDeltaThresholdMillis &&
      arrival_time_millis - current_timestamp_group_.first_arrival_millis < kMaxBurstDurationMillis)
    return true;
  return false;
}

void InterArrivalDelta::Reset() {
  num_consecutive_reordered_packets_ = 0;
  current_timestamp_group_ = SendTimeGroup();
  prev_timestamp_group_ = SendTimeGroup();
}