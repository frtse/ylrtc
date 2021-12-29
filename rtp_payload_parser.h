#pragma once

#include <cstddef>
#include <cstdint>
#include <optional>
#include <string_view>

struct PayloadInfo {
  bool keyframe;
};

class RtpPayloadParser {
 public:
  static std::optional<PayloadInfo> Parse(const std::string_view codec, uint8_t* data, size_t size);
};
