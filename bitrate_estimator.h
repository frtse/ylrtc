#pragma once

#include <stddef.h>
#include <stdint.h>

#include <deque>
#include <memory>
#include <optional>

/**
 * @brief Class used to calculate bit rate.
 * 
 */
class BitRateEstimator {
 public:
  BitRateEstimator();

  void Update(int64_t count, int64_t now_ms);
  std::optional<int64_t> Rate(int64_t now_ms) const;

 private:
  void EraseOld(int64_t now_ms);

  struct Bucket {
    explicit Bucket(int64_t timestamp);
    int64_t sum;              // Sum of all samples in this bucket.
    int num_samples;          // Number of samples in this bucket.
    const int64_t timestamp;  // Timestamp this bucket corresponds to.
  };
  // All buckets within the time window, ordered by time.
  std::deque<Bucket> buckets_;

  // Total count recorded in all buckets.
  int64_t accumulated_count_;

  // Timestamp of the first data point seen, or -1 of none seen.
  int64_t first_timestamp_;

  // True if accumulated_count_ has ever grown too large to be
  // contained in its integer type.
  bool overflow_ = false;

  // The total number of samples in the buckets.
  int num_samples_;

  // The window sizes, in ms, over which the rate is calculated.
  int64_t window_size_ms_;
};