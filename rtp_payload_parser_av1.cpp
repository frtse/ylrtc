#include "rtp_payload_parser_av1.h"

bool RtpStartsWithFragment(uint8_t aggregation_header) {
  return aggregation_header & 0b1000'0000u;
}

int RtpStartsNewCodedVideoSequence(uint8_t aggregation_header) {
  return aggregation_header & 0b0000'1000u;
}

std::optional<PayloadInfo> RtpPayloadParserAv1::Parse(uint8_t* data, size_t size) {
  if (size == 0)
    return std::nullopt;
  uint8_t aggregation_header = data[0];
  if (RtpStartsNewCodedVideoSequence(aggregation_header) &&
      RtpStartsWithFragment(aggregation_header)) {
    // new coded video sequence can't start from an OBU fragment.
    return std::nullopt;
  }
  PayloadInfo info;
  info.keyframe = RtpStartsNewCodedVideoSequence(aggregation_header);
  return info;
}
