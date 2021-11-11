#pragma once

#include <boost/stacktrace.hpp>
#include <cmath>
#include <cstddef>
#include <cstdint>
#include <functional>
#include <limits>
#include <memory>
#include <numeric>
#include <string>
#include <vector>
#include <iostream>

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

std::vector<std::string> StringSplit(const std::string& s, const char* delim);
std::string StringToLower(std::string str);

#define CHECK(expression)                                             \
  do {                                                                  \
    if (!(expression)) {                                                \
      std::cerr << "Assertion failed: " << __FILE__ << ":" << __LINE__ \
                 << "\n\t"                                              \
                 << "Expression: " << #expression << "\n\t"             \
                 << "Stack trace:\n"                                    \
                 << boost::stacktrace::stacktrace() << std::endl;       \
      abort();                                                          \
    }                                                                   \
  } while (false)

#ifdef NDEBUG
#define DCHECK(expression)
#else
#define DCHECK(expression) CHECK(expression)
#endif
