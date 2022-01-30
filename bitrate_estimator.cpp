#include "bitrate_estimator.h"

#include <algorithm>
#include <limits>
#include <memory>

#include "spdlog/spdlog.h"

BitRateEstimator::Bucket::Bucket(int64_t timestamp) : sum(0), num_samples(0), timestamp(timestamp) {}

BitRateEstimator::BitRateEstimator()
    : accumulated_count_(0),
      first_timestamp_(-1),
      num_samples_(0),
      window_size_ms_(1000) {}

void BitRateEstimator::Update(int64_t count, int64_t now_ms) {
  EraseOld(now_ms);
  if (first_timestamp_ == -1) {
    first_timestamp_ = now_ms;
  }

  if (buckets_.empty() || now_ms != buckets_.back().timestamp) {
    if (!buckets_.empty() && now_ms < buckets_.back().timestamp) {
      spdlog::warn("Timestamp {} is before the last added timestamp in the rate window: {}, aligning to that.", now_ms, buckets_.back().timestamp);
      now_ms = buckets_.back().timestamp;
    }
    buckets_.emplace_back(now_ms);
  }
  Bucket& last_bucket = buckets_.back();
  last_bucket.sum += count;
  ++last_bucket.num_samples;

  if (std::numeric_limits<int64_t>::max() - accumulated_count_ > count) {
    accumulated_count_ += count;
  } else {
    overflow_ = true;
  }
  ++num_samples_;
}

std::optional<int64_t> BitRateEstimator::Rate(int64_t now_ms) const {
  // Yeah, this const_cast ain't pretty, but the alternative is to declare most
  // of the members as mutable...
  const_cast<BitRateEstimator*>(this)->EraseOld(now_ms);

  int64_t active_window_size = 0;
  if (first_timestamp_ != -1) {
    if (first_timestamp_ <= now_ms - window_size_ms_) {
      // Count window as full even if no data points currently in view, if the
      // data stream started before the window.
      active_window_size = window_size_ms_;
    } else {
      // Size of a single bucket is 1ms, so even if now_ms == first_timestmap_
      // the window size should be 1.
      active_window_size = now_ms - first_timestamp_ + 1;
    }
  }

  // If window is a single bucket or there is only one sample in a data set that
  // has not grown to the full window size, or if the accumulator has
  // overflowed, treat this as rate unavailable.
  if (num_samples_ == 0 || active_window_size <= 1 || (num_samples_ <= 1 && active_window_size < window_size_ms_) || overflow_) {
    return std::nullopt;
  }

  float result = static_cast<float>(accumulated_count_ * 1000 / active_window_size * 8)  + 0.5f;

  if (result > static_cast<float>(std::numeric_limits<int64_t>::max()))
    return std::nullopt;

  return result;
}

void BitRateEstimator::EraseOld(int64_t now_ms) {
  // New oldest time that is included in data set.
  const int64_t new_oldest_time = now_ms - window_size_ms_ + 1;

  // Loop over buckets and remove too old data points.
  while (!buckets_.empty() && buckets_.front().timestamp < new_oldest_time) {
    const Bucket& oldest_bucket = buckets_.front();
    accumulated_count_ -= oldest_bucket.sum;
    num_samples_ -= oldest_bucket.num_samples;
    buckets_.pop_front();
    // This does not clear overflow_ even when counter is empty.
    // TODO(https://bugs.webrtc.org/11247): Consider if overflow_ can be reset.
  }
}