#include "utils.h"

#include <algorithm>
#include <chrono>
#include <iterator>
#include <string_view>

// clang-format off
#include "spdlog/spdlog.h"
#include "spdlog/fmt/bin_to_hex.h"
// clang-format on

int64_t TimeMillis() {
  return std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
}

void DumpHex(const uint8_t* data, size_t size) {
  std::string_view str((char*)data, size);
  spdlog::debug("{:n}", spdlog::to_hex(str));
}

NtpTime NtpTime::CreateFromMillis(uint64_t millis) {
  uint32_t seconds = millis / 1000;
  uint32_t fractions = static_cast<uint32_t>((static_cast<double>(millis % 1000) / 1000) * kFractionsPerSecond);

  return NtpTime(seconds, fractions);
}

NtpTime NtpTime::CreateFromCompactNtp(uint32_t compact_ntp) {
  return NtpTime(compact_ntp >> 16, compact_ntp << 16);
}

NtpTime::NtpTime(uint32_t seconds, uint32_t fractions) : seconds_{seconds}, fractions_{fractions} {}

int64_t NtpTime::ToMillis() const {
  static constexpr double kNtpFracPerMs = 4.294967296E6;  // 2^32 / 1000.
  const double frac_ms = static_cast<double>(Fractions()) / kNtpFracPerMs;
  return 1000 * static_cast<int64_t>(Seconds()) + static_cast<int64_t>(frac_ms + 0.5);
}

uint32_t NtpTime::Seconds() const {
  return seconds_;
}

uint32_t NtpTime::Fractions() const {
  return fractions_;
}

uint32_t NtpTime::ToCompactNtp() {
  return (seconds_ << 16) | (fractions_ >> 16);
}

std::vector<std::string> StringSplit(const std::string& s, const char* delim) {
  std::vector<std::string> ret;
  int last = 0;
  int index = s.find(delim, last);
  while (index != std::string::npos) {
    if (index - last > 0) {
      ret.push_back(s.substr(last, index - last));
    }
    last = index + strlen(delim);
    index = s.find(delim, last);
  }
  if (!s.empty() && s.size() - last > 0) {
    ret.push_back(s.substr(last));
  }
  return ret;
}

std::string StringToLower(std::string str) {
  std::transform(str.begin(), str.end(), str.begin(), towlower);
  return str;
}