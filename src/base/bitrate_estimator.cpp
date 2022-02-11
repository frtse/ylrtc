#include "bitrate_estimator.h"

#include <algorithm>
#include <limits>

static constexpr size_t kDefaultWindowSizeMillis = 1000;

BitRateEstimator::Buffer::Buffer(int64_t timestamp) : total_bytes(0), num_samples(0), timestamp(timestamp) {}

BitRateEstimator::BitRateEstimator()
    : total_bytes_(0),
      first_timestamp_(-1),
      num_samples_(0),
      window_size_ms_(kDefaultWindowSizeMillis) {}

void BitRateEstimator::AddData(int64_t bytes, int64_t now_ms) {
  EraseOld(now_ms);
  if (first_timestamp_ == -1) {
    first_timestamp_ = now_ms;
  }

  if (buffers_.empty() || now_ms != buffers_.back().timestamp) {
    if (!buffers_.empty() && now_ms < buffers_.back().timestamp) {
      now_ms = buffers_.back().timestamp;
    }
    buffers_.emplace_back(now_ms);
  }
  Buffer& last_bucket = buffers_.back();
  last_bucket.total_bytes += bytes;
  ++last_bucket.num_samples;

  if (std::numeric_limits<int64_t>::max() - total_bytes_ > bytes) {
    total_bytes_ += bytes;
  } else {
    overflow_ = true;
  }
  ++num_samples_;
}

std::optional<int64_t> BitRateEstimator::Rate(int64_t now_ms) const {
  const_cast<BitRateEstimator*>(this)->EraseOld(now_ms);

  int64_t active_window_size = 0;
  if (first_timestamp_ != -1) {
    if (first_timestamp_ <= now_ms - window_size_ms_) {
      active_window_size = window_size_ms_;
    } else {
      active_window_size = now_ms - first_timestamp_ + 1;
    }
  }

  if (num_samples_ == 0 || active_window_size <= 1 || (num_samples_ <= 1 && active_window_size < window_size_ms_) || overflow_) {
    return std::nullopt;
  }

  float result = static_cast<float>(total_bytes_ * 1000 / active_window_size * 8)  + 0.5f;

  if (result > static_cast<float>(std::numeric_limits<int64_t>::max()))
    return std::nullopt;

  return result;
}

void BitRateEstimator::EraseOld(int64_t now_ms) {
  const int64_t new_oldest_time = now_ms - window_size_ms_ + 1;
  while (!buffers_.empty() && buffers_.front().timestamp < new_oldest_time) {
    const Buffer& oldest_bucket = buffers_.front();
    total_bytes_ -= oldest_bucket.total_bytes;
    num_samples_ -= oldest_bucket.num_samples;
    buffers_.pop_front();
  }
}