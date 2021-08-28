#pragma once

#include <cmath>
#include <cstddef>
#include <cstdint>
#include <functional>
#include <memory>
#include <numeric>
#include <string>
#include <vector>
#include <limits>

#include "boost/circular_buffer.hpp"

int64_t TimeMillis();

void DumpHex(const uint8_t* data, size_t size);

class NtpTime {
 public:
  static NtpTime CreateFromMillis(uint64_t millis);
  static NtpTime CreateFromCompactNtp(uint32_t compact_ntp);

  NtpTime(uint32_t seconds, uint32_t fractions);

  int64_t ToMillis() const;
  uint32_t Seconds() const;
  uint32_t Fractions() const;
  uint32_t ToCompactNtp();

 private:
  static constexpr uint64_t kFractionsPerSecond = 1ULL << 32;
  uint32_t seconds_;
  uint32_t fractions_;
};

class BitRate {
 public:
  size_t GetBitRate(int64_t time);

  void Update(size_t data_size, int64_t time);

 private:
  boost::circular_buffer<size_t> data_buffer_{1000, 0};  // 1000ms
  int64_t last_time_{-1};
};

std::vector<std::string> StringSplit(const std::string& s, const char* delim);
std::string StringToLower(std::string str);

template <typename U>
inline bool IsNewer(U value, U prev_value) {
  static_assert(!std::numeric_limits<U>::is_signed, "U must be unsigned");
  // kBreakpoint is the half-way mark for the type U. For instance, for a
  // uint16_t it will be 0x8000, and for a uint32_t, it will be 0x8000000.
  constexpr U kBreakpoint = (std::numeric_limits<U>::max() >> 1) + 1;
  // Distinguish between elements that are exactly kBreakpoint apart.
  // If t1>t2 and |t1-t2| = kBreakpoint: IsNewer(t1,t2)=true,
  // IsNewer(t2,t1)=false
  // rather than having IsNewer(t1,t2) = IsNewer(t2,t1) = false.
  if (value - prev_value == kBreakpoint) {
    return value > prev_value;
  }
  return value != prev_value &&
         static_cast<U>(value - prev_value) < kBreakpoint;
}

// NB: Doesn't fulfill strict weak ordering requirements.
//     Mustn't be used as std::map Compare function.
inline bool IsNewerSequenceNumber(uint16_t sequence_number,
                                  uint16_t prev_sequence_number) {
  return IsNewer(sequence_number, prev_sequence_number);
}