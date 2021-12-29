#include "rtp_payload_parser_h264.h"

#include <arpa/inet.h>
#include <string.h>
#include <vector>
#include "byte_buffer.h"

enum NaluType : uint8_t {
  kSlice = 1,
  kIdr = 5,
  kSei = 6,
  kSps = 7,
  kPps = 8,
  kAud = 9,
  kEndOfSequence = 10,
  kEndOfStream = 11,
  kFiller = 12,
  kPrefix = 14,
  kStapA = 24,
  kFuA = 28
};

bool ParseStapAStartOffsets(const uint8_t* nalu_ptr,
                            size_t length_remaining,
                            std::vector<size_t>* offsets) {
  size_t offset = 0;
  while (length_remaining > 0) {
    if (length_remaining < sizeof(uint16_t))
      return false;
    uint16_t nalu_size = LoadUInt16BE(nalu_ptr);
    nalu_ptr += sizeof(uint16_t);
    length_remaining -= sizeof(uint16_t);
    if (nalu_size > length_remaining)
      return false;
    nalu_ptr += nalu_size;
    length_remaining -= nalu_size;

    offsets->push_back(offset + 3);
    offset += 2 + nalu_size;
  }
  return true;
}

std::optional<PayloadInfo> RtpPayloadParserH264::Parse(uint8_t* buffer, size_t len) {
  if (len < 1)
    return std::nullopt;
  PayloadInfo info;
  uint8_t nal_type = buffer[0] & 0x1F;
  if (nal_type == 28) {
    if (len < 2)
      return std::nullopt;
    uint8_t original_nal_type = buffer[1] & 0x1F;
    if (original_nal_type == 5)
      info.keyframe = true;
  }
  else {
    std::vector<size_t> nalu_start_offsets;
    const uint8_t* nalu_start = buffer + 1;
    const size_t nalu_length = len - 1;
    if (nal_type == 24) {
      if (len <= 3)
        return std::nullopt;
      if (!ParseStapAStartOffsets(nalu_start, nalu_length, &nalu_start_offsets))
        return std::nullopt;
    }
    else {
      nalu_start_offsets.push_back(0);
    }

    for (size_t i = 0; i < nalu_start_offsets.size() - 1; ++i) {
      size_t start_offset = nalu_start_offsets[i];
      size_t end_offset = nalu_start_offsets[i + 1] - 2;
      if (end_offset - start_offset < 1)
        return std::nullopt;
      uint8_t type = buffer[start_offset] & 0x1F;
      if (type == 7 || type == 5)
        info.keyframe = true;
    }
  }
  return info;
}
