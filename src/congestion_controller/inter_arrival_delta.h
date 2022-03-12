#pragma once

#include <cstdint>
#include <cstddef>

// Helper class to compute the inter-arrival time delta and the size delta
// between two send bursts.
class InterArrivalDelta {
 public:
  InterArrivalDelta();
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
  bool ComputeDeltas(int64_t send_time_millis,
                     int64_t arrival_time_millis,
                     int64_t system_time_millis,
                     size_t packet_size,
                     int64_t* send_time_delta_millis,
                     int64_t* arrival_time_delta_millis,
                     int* packet_size_delta_millis);

 private:
  struct SendTimeGroup {
    SendTimeGroup()
        : size(0),
          first_send_time_millis(-1),
          send_time_millis(-1),
          first_arrival_millis(-1),
          complete_time_millis(-1),
          last_system_time_millis(-1) {}

    bool IsFirstPacket() const { return complete_time_millis == -1; }

    size_t size;
    int64_t first_send_time_millis;
    int64_t send_time_millis;
    int64_t first_arrival_millis;
    int64_t complete_time_millis;
    int64_t last_system_time_millis;
  };

  // Returns true if the last packet was the end of the current batch and the
  // packet with `send_time` is the first of a new batch.
  bool NewTimestampGroup(int64_t arrival_time_millis, int64_t send_time_millis) const;

  bool BelongsToBurst(int64_t arrival_time, int64_t send_time) const;

  void Reset();

  const int64_t send_time_group_length_millis_;
  SendTimeGroup current_timestamp_group_;
  SendTimeGroup prev_timestamp_group_;
  int num_consecutive_reordered_packets_;
};