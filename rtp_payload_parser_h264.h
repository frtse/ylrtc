#pragma once

#include <cstddef>
#include <cstdint>
#include <optional>

#include "rtp_payload_parser.h"

class RtpPayloadParserH264 {
 public:
  static std::optional<PayloadInfo> Parse(uint8_t* buffer, size_t len);
};