#include "inter_arrival_delta.h"

#include "utils.h"
#include "spdlog/spdlog.h"

static constexpr int64_t kBurstDeltaThresholdMillis = 5;
static constexpr int64_t kMaxBurstDurationMillis = 100;
constexpr int64_t InterArrivalDelta::kArrivalTimeOffsetThresholdMillis;

InterArrivalDelta::InterArrivalDelta(int64_t send_time_group_length_millis)
    : send_time_group_length_millis_(send_time_group_length_millis),
      current_timestamp_group_(),
      prev_timestamp_group_(),
      num_consecutive_reordered_packets_(0) {}

bool InterArrivalDelta::ComputeDeltas(int64_t send_time,
                                      int64_t arrival_time,
                                      int64_t system_time,
                                      size_t packet_size,
                                      int64_t* send_time_delta,
                                      int64_t* arrival_time_delta,
                                      int* packet_size_delta) {
  bool calculated_deltas = false;
  if (current_timestamp_group_.IsFirstPacket()) {
    // We don't have enough data to update the filter, so we store it until we
    // have two frames of data to process.
    current_timestamp_group_.send_time = send_time;
    current_timestamp_group_.first_send_time = send_time;
    current_timestamp_group_.first_arrival = arrival_time;
  } else if (current_timestamp_group_.first_send_time > send_time) {
    // Reordered packet.
    return false;
  } else if (NewTimestampGroup(arrival_time, send_time)) {
    // First packet of a later send burst, the previous packets sample is ready.
    if (prev_timestamp_group_.complete_time >= 0) {
      *send_time_delta =
          current_timestamp_group_.send_time - prev_timestamp_group_.send_time;
      *arrival_time_delta = current_timestamp_group_.complete_time -
                            prev_timestamp_group_.complete_time;

      int64_t system_time_delta = current_timestamp_group_.last_system_time -
                                    prev_timestamp_group_.last_system_time;

      if (*arrival_time_delta - system_time_delta >=
          kArrivalTimeOffsetThresholdMillis) {
        spdlog::warn("The arrival time clock offset has changed (diff = {} ms), resetting.", *arrival_time_delta - system_time_delta);
        Reset();
        return false;
      }
      if (*arrival_time_delta < 0) {
        // The group of packets has been reordered since receiving its local
        // arrival timestamp.
        ++num_consecutive_reordered_packets_;
        if (num_consecutive_reordered_packets_ >= kReorderedResetThreshold) {
          spdlog::warn("Packets between send burst arrived out of order, resetting."
            " arrival_time_delta {}  send time delta {}", *arrival_time_delta, *send_time_delta);
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
    current_timestamp_group_.first_send_time = send_time;
    current_timestamp_group_.send_time = send_time;
    current_timestamp_group_.first_arrival = arrival_time;
    current_timestamp_group_.size = 0;
  } else {
    current_timestamp_group_.send_time =
        std::max(current_timestamp_group_.send_time, send_time);
  }
  // Accumulate the frame size.
  current_timestamp_group_.size += packet_size;
  current_timestamp_group_.complete_time = arrival_time;
  current_timestamp_group_.last_system_time = system_time;

  return calculated_deltas;
}

// Assumes that `timestamp` is not reordered compared to
// `current_timestamp_group_`.
bool InterArrivalDelta::NewTimestampGroup(int64_t arrival_time,
                                          int64_t send_time) const {
  if (current_timestamp_group_.IsFirstPacket()) {
    return false;
  } else if (BelongsToBurst(arrival_time, send_time)) {
    return false;
  } else {
    return send_time - current_timestamp_group_.first_send_time >
           send_time_group_length_millis_;
  }
}

bool InterArrivalDelta::BelongsToBurst(int64_t arrival_time,
                                       int64_t send_time) const {
  DCHECK(current_timestamp_group_.complete_time >= 0);
  int64_t arrival_time_delta =
      arrival_time - current_timestamp_group_.complete_time;
  int64_t send_time_delta = send_time - current_timestamp_group_.send_time;
  if (send_time_delta == 0)
    return true;
  int64_t propagation_delta = arrival_time_delta - send_time_delta;
  if (propagation_delta < 0 &&
      arrival_time_delta <= kBurstDeltaThresholdMillis &&
      arrival_time - current_timestamp_group_.first_arrival < kMaxBurstDurationMillis)
    return true;
  return false;
}

void InterArrivalDelta::Reset() {
  num_consecutive_reordered_packets_ = 0;
  current_timestamp_group_ = SendTimeGroup();
  prev_timestamp_group_ = SendTimeGroup();
}