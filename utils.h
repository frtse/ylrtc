#pragma once

#include <cmath>
#include <cstddef>
#include <cstdint>
#include <functional>
#include <limits>
#include <memory>
#include <numeric>
#include <string>
#include <vector>

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