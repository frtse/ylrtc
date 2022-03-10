#pragma once

#include <cstdint>
#include <cstddef>

// Helper class to compute the inter-arrival time delta and the size delta
// between two send bursts. This code is branched from
// modules/remote_bitrate_estimator/inter_arrival.
class InterArrivalDelta {
 public:
  // After this many packet groups received out of order InterArrival will
  // reset, assuming that clocks have made a jump.
  static constexpr int kReorderedResetThreshold = 3;
  static constexpr int64_t kArrivalTimeOffsetThresholdMillis = 3000;

  // A send time group is defined as all packets with a send time which are at
  // most send_time_group_length older than the first timestamp in that
  // group.
  explicit InterArrivalDelta(int64_t send_time_group_length_millis);

  InterArrivalDelta() = delete;
  InterArrivalDelta(const InterArrivalDelta&) = delete;
  InterArrivalDelta& operator=(const InterArrivalDelta&) = delete;

  // This function returns true if a delta was computed, or false if the current
  // group is still incomplete or if only one group has been completed.
  // `send_time` is the send time.
  // `arrival_time` is the time at which the packet arrived.
  // `packet_size` is the size of the packet.
  // `timestamp_delta` (output) is the computed send time delta.
  // `arrival_time_delta_ms` (output) is the computed arrival-time delta.
  // `packet_size_delta` (output) is the computed size delta.
  bool ComputeDeltas(int64_t send_time,
                     int64_t arrival_time,
                     int64_t system_time,
                     size_t packet_size,
                     int64_t* send_time_delta,
                     int64_t* arrival_time_delta,
                     int* packet_size_delta);

 private:
  struct SendTimeGroup {
    SendTimeGroup()
        : size(0),
          first_send_time(-1),
          send_time(-1),
          first_arrival(-1),
          complete_time(-1),
          last_system_time(-1) {}

    bool IsFirstPacket() const { return complete_time == -1; }

    size_t size;
    int64_t first_send_time;
    int64_t send_time;
    int64_t first_arrival;
    int64_t complete_time;
    int64_t last_system_time;
  };

  // Returns true if the last packet was the end of the current batch and the
  // packet with `send_time` is the first of a new batch.
  bool NewTimestampGroup(int64_t arrival_time, int64_t send_time) const;

  bool BelongsToBurst(int64_t arrival_time, int64_t send_time) const;

  void Reset();

  const int64_t send_time_group_length_millis_;
  SendTimeGroup current_timestamp_group_;
  SendTimeGroup prev_timestamp_group_;
  int num_consecutive_reordered_packets_;
};