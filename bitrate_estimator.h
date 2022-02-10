#pragma once

#include <stddef.h>
#include <stdint.h>

#include <deque>
#include <optional>

/**
 * @brief Class used to calculate bit rate.
 * 
 */
class BitRateEstimator {
 public:
  BitRateEstimator();

  void AddData(int64_t bytes, int64_t now_ms);
  std::optional<int64_t> Rate(int64_t now_ms) const;

 private:
  void EraseOld(int64_t now_ms);
  struct Buffer {
    explicit Buffer(int64_t timestamp);
    int64_t total_bytes;
    int num_samples;
    const int64_t timestamp;
  };
  std::deque<Buffer> buffers_;
  int64_t total_bytes_;
  int64_t first_timestamp_;
  bool overflow_ = false;
  int num_samples_;
  int64_t window_size_ms_;
};