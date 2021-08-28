#pragma once

#include <cstdint>
#include <cstddef>
#include <optional>
#include <string_view>

enum class VideoFrameType {
  kEmptyFrame = 0,
  // Wire format for MultiplexEncodedImagePacker seems to depend on numerical
  // values of these constants.
  kVideoFrameKey = 3,
  kVideoFrameDelta = 4,
};

struct PayloadInfo {
  VideoFrameType frame_type = VideoFrameType::kEmptyFrame;
  bool is_first_packet_in_frame = false;
};

class RtpPayloadParser {
public:
  static std::optional<PayloadInfo> Parse(const std::string_view codec, uint8_t* data, size_t size);
};
