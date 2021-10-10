#pragma once

#include <stdint.h>

#include <limits>
#include <optional>
#include <type_traits>

// Test if the sequence number `a` is greater than or equal to sequence number `b`.
template <typename T>
inline bool SeqNumGE(T a, T b) {
  static_assert(std::is_unsigned<T>::value, "Type must be an unsigned integer.");
  // std::numeric_limits<T>::max() is always odd, so add one to the result.
  const T maxDist = std::numeric_limits<T>::max() / 2 + T(1);
  if (a - b == maxDist)
    return a > b;
  return static_cast<T>(a - b) < maxDist;
}

// Test if the sequence number `a` is greater than sequence number `b`.
template <typename T>
inline bool SeqNumGT(T a, T b) {
  static_assert(std::is_unsigned<T>::value, "Type must be an unsigned integer.");
  return a != b && SeqNumGE<T>(a, b);
}

template <typename T>
struct IsSeqNumLowerThan {
  bool operator()(T a, T b) const {
    return SeqNumGT<T>(b, a);
  }
};

// Sequence number unwrapper.
template <typename T>
class SeqNumUnwrapper {
  static_assert(std::is_unsigned<T>::value && std::numeric_limits<T>::max() < std::numeric_limits<int64_t>::max(), "Type unwrapped must be an unsigned integer smaller than int64_t.");

 public:
   // Get the unwrapped value, and update the internal state.
  int64_t Unwrap(T value) {
    if (!last_value_) {
      last_unwrapped_ = {value};
    } else {
      last_unwrapped_ += static_cast<T>(value - *last_value_);

      if (!SeqNumGE<T>(value, *last_value_)) {
        constexpr int64_t kBackwardAdjustment = int64_t{std::numeric_limits<T>::max()} + 1;
        last_unwrapped_ -= kBackwardAdjustment;
      }
    }

    last_value_ = value;
    return last_unwrapped_;
  }

  // Get the unwrapped value, but don't update the internal state.
  int64_t UnwrapWithoutUpdate(T value) {
    last_without_update_value_ = value;
    if (!last_value_) {
      return value;
    } else {
      int64_t unwrapped = 0;
      unwrapped += static_cast<T>(value - *last_value_);

      if (!SeqNumGE<T>(value, *last_value_)) {
        constexpr int64_t kBackwardAdjustment = int64_t{std::numeric_limits<T>::max()} + 1;
        unwrapped -= kBackwardAdjustment;
      }

      return unwrapped;
    }
  }
  // Only update the internal state to the specified last (unwrapped) value.
  void UpdateLast(int64_t last_value) {
    if (last_without_update_value_)
      last_value_ = last_without_update_value_;
    last_unwrapped_ = last_value;
  }
 private:
  int64_t last_unwrapped_ = 0;
  std::optional<T> last_value_;
  std::optional<T> last_without_update_value_;
};