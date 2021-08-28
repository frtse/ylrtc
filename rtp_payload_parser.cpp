#include "rtp_payload_parser.h"

#include "rtp_payload_parser_vp8.h"

std::optional<PayloadInfo> RtpPayloadParser::Parse(const std::string_view codec, uint8_t* data, size_t size) {
  if (codec == "vp8")
    return RtpPayloadParserVp8::Parse(data, size);
  else
    return std::nullopt;
}
