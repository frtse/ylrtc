#include "rtp_payload_parser_vp8.h"

#include "spdlog/spdlog.h"

// VP8 format:
//
// Payload descriptor
//       0 1 2 3 4 5 6 7
//      +-+-+-+-+-+-+-+-+
//      |X|R|N|S|PartID | (REQUIRED)
//      +-+-+-+-+-+-+-+-+
// X:   |I|L|T|K|  RSV  | (OPTIONAL)
//      +-+-+-+-+-+-+-+-+
// I:   |   PictureID   | (OPTIONAL)
//      +-+-+-+-+-+-+-+-+
// L:   |   TL0PICIDX   | (OPTIONAL)
//      +-+-+-+-+-+-+-+-+
// T/K: |TID:Y| KEYIDX  | (OPTIONAL)
//      +-+-+-+-+-+-+-+-+
//
// Payload header (considered part of the actual payload, sent to decoder)
//       0 1 2 3 4 5 6 7
//      +-+-+-+-+-+-+-+-+
//      |Size0|H| VER |P|
//      +-+-+-+-+-+-+-+-+
//      |      ...      |
//      +               +

const int16_t kNoPictureId = -1;
const int16_t kNoTl0PicIdx = -1;
const uint8_t kNoTemporalIdx = 0xFF;
const int kNoKeyIdx = -1;
constexpr int kFailedToParse = 0;

struct RTPVideoHeaderVP8 {
  void InitRTPVideoHeaderVP8() {
    nonReference = false;
    pictureId = kNoPictureId;
    tl0PicIdx = kNoTl0PicIdx;
    temporalIdx = kNoTemporalIdx;
    layerSync = false;
    keyIdx = kNoKeyIdx;
    partitionId = 0;
    beginningOfPartition = false;
  }

  bool nonReference;          // Frame is discardable.
  int16_t pictureId;          // Picture ID index, 15 bits;
                              // kNoPictureId if PictureID does not exist.
  int16_t tl0PicIdx;          // TL0PIC_IDX, 8 bits;
                              // kNoTl0PicIdx means no value provided.
  uint8_t temporalIdx;        // Temporal layer index, or kNoTemporalIdx.
  bool layerSync;             // This frame is a layer sync frame.
                              // Disabled if temporalIdx == kNoTemporalIdx.
  int keyIdx;                 // 5 bits; kNoKeyIdx means not used.
  int partitionId;            // VP8 partition ID
  bool beginningOfPartition;  // True if this packet is the first
                              // in a VP8 partition. Otherwise false
};

int ParseVP8Descriptor(RTPVideoHeaderVP8* vp8, const uint8_t* data, size_t data_length) {
  if (data_length <= 0)
    return kFailedToParse;
  int parsed_bytes = 0;
  // Parse mandatory first byte of payload descriptor.
  bool extension = (*data & 0x80) ? true : false;             // X bit
  vp8->nonReference = (*data & 0x20) ? true : false;          // N bit
  vp8->beginningOfPartition = (*data & 0x10) ? true : false;  // S bit
  vp8->partitionId = (*data & 0x0F);                          // PartID field

  data++;
  parsed_bytes++;
  data_length--;

  if (!extension)
    return parsed_bytes;

  if (data_length == 0)
    return kFailedToParse;
  // Optional X field is present.
  bool has_picture_id = (*data & 0x80) ? true : false;   // I bit
  bool has_tl0_pic_idx = (*data & 0x40) ? true : false;  // L bit
  bool has_tid = (*data & 0x20) ? true : false;          // T bit
  bool has_key_idx = (*data & 0x10) ? true : false;      // K bit

  // Advance data and decrease remaining payload size.
  data++;
  parsed_bytes++;
  data_length--;

  if (has_picture_id) {
    if (data_length == 0)
      return kFailedToParse;

    vp8->pictureId = (*data & 0x7F);
    if (*data & 0x80) {
      data++;
      parsed_bytes++;
      if (--data_length == 0)
        return kFailedToParse;
      // PictureId is 15 bits
      vp8->pictureId = (vp8->pictureId << 8) + *data;
    }
    data++;
    parsed_bytes++;
    data_length--;
  }

  if (has_tl0_pic_idx) {
    if (data_length == 0)
      return kFailedToParse;

    vp8->tl0PicIdx = *data;
    data++;
    parsed_bytes++;
    data_length--;
  }

  if (has_tid || has_key_idx) {
    if (data_length == 0)
      return kFailedToParse;

    if (has_tid) {
      vp8->temporalIdx = ((*data >> 6) & 0x03);
      vp8->layerSync = (*data & 0x20) ? true : false;  // Y bit
    }
    if (has_key_idx) {
      vp8->keyIdx = *data & 0x1F;
    }
    data++;
    parsed_bytes++;
    data_length--;
  }
  return parsed_bytes;
}

std::optional<PayloadInfo> RtpPayloadParserVp8::Parse(uint8_t* data, size_t size) {
  PayloadInfo payload_info;
  if (size == 0) {
    spdlog::error("Empty rtp payload.");
    return std::nullopt;
  }

  RTPVideoHeaderVP8 vp8_header;
  vp8_header.InitRTPVideoHeaderVP8();

  const int descriptor_size = ParseVP8Descriptor(&vp8_header, data, size);
  if (descriptor_size == kFailedToParse)
    return std::nullopt;

  if (vp8_header.partitionId > 8) {
    // Weak check for corrupt payload_data: PartID MUST NOT be larger than 8.
    return std::nullopt;
  }
  bool is_first_packet_in_frame = false;
  is_first_packet_in_frame = vp8_header.beginningOfPartition && vp8_header.partitionId == 0;

  int vp8_payload_size = size - descriptor_size;
  if (vp8_payload_size == 0) {
    spdlog::warn("Empty vp8 payload.");
    return std::nullopt;
  }
  const uint8_t* vp8_payload = data + descriptor_size;

  // Read P bit from payload header (only at beginning of first partition).
  if (is_first_packet_in_frame && (*vp8_payload & 0x01) == 0) {
    payload_info.keyframe = true;

    if (vp8_payload_size < 10) {
      // For an I-frame we should always have the uncompressed VP8 header
      // in the beginning of the partition.
      return std::nullopt;
    }
  } else {
    payload_info.keyframe = false;
  }

  return payload_info;
}