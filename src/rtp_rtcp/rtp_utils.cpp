#include "rtp_utils.h"

#include "byte_buffer.h"

bool IsRtpPacket(uint8_t* data, size_t len) {
  return len >= kMinRtpPacketLen && data[0] >> 6 == kRtpVersion;
}

std::optional<uint32_t> GetRtpSsrc(uint8_t* data, size_t size) {
  if (size < kMinRtpPacketLen)
    return std::nullopt;
  return LoadUInt32BE(data + 8);
}

void SetRtpSsrc(uint8_t* data, size_t size, uint32_t ssrc) {
  if (size < kMinRtpPacketLen)
    return;
  StoreUInt32BE(data + 8, ssrc);
}

void SetPayloadType(uint8_t* data, size_t size, uint8_t payload_type) {
  if (size < kMinRtpPacketLen)
    return;
  data[1] = (data[1] & 0x80) | payload_type;
}

void SetSequenceNumber(uint8_t* data, size_t size, uint16_t seq_no) {
  if (size < kMinRtpPacketLen)
    return;
  StoreUInt16BE(data + 2, seq_no);
}

std::optional<size_t> GetRtpHeaderLength(const uint8_t* rtp, size_t length) {
  if (length < kMinRtpPacketLen) {
    return std::nullopt;
  }

  size_t cc_count = rtp[0] & 0x0F;
  size_t header_length_without_extension = kMinRtpPacketLen + 4 * cc_count;
  if (header_length_without_extension > length) {
    return std::nullopt;
  }

  // If extension bit is not set, we are done with header processing, as input
  // length is verified above.
  if (!(rtp[0] & 0x10)) {
    return header_length_without_extension;
  }

  rtp += header_length_without_extension;

  if (header_length_without_extension + kRtpExtensionHeaderLen > length) {
    return std::nullopt;
  }

  // Getting extension profile length.
  // Length is in 32 bit words.
  uint16_t extension_length_in_32bits = LoadUInt16BE(rtp + 2);
  size_t extension_length = extension_length_in_32bits * 4;

  size_t rtp_header_length = extension_length + header_length_without_extension + kRtpExtensionHeaderLen;

  // Verify input length against total header size.
  if (rtp_header_length > length) {
    return std::nullopt;
  }

  return rtp_header_length;
}