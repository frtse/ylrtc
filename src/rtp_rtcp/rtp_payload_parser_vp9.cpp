#include "rtp_payload_parser_vp9.h"

std::optional<PayloadInfo> RtpPayloadParserVp9::Parse(uint8_t* data, size_t size) {
  if (size == 0)
    return std::nullopt;
  uint8_t first_byte = data[0];
  bool p_bit = first_byte & 0b0100'0000;  // Inter-picture predicted.
  PayloadInfo info;
  info.keyframe = !p_bit;
  return info;
}