#include "rtp_header_extension.h"

#include "byte_buffer.h"
#include "utils.h"

std::unordered_map<std::string, RTPHeaderExtensionType> UriRTPHeaderExtensionMap = {
    {"urn:ietf:params:rtp-hdrext:toffset", kRtpExtensionTransmissionTimeOffset},
    {"urn:ietf:params:rtp-hdrext:ssrc-audio-level", kRtpExtensionAudioLevel},
    {"urn:ietf:params:rtp-hdrext:csrc-audio-level", kRtpExtensionCsrcAudioLevel},
    {"http://www.webrtc.org/experiments/rtp-hdrext/inband-cn", kRtpExtensionInbandComfortNoise},
    {"http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time", kRtpExtensionAbsoluteSendTime},
    {"http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time", kRtpExtensionAbsoluteCaptureTime},
    {"urn:3gpp:video-orientation", kRtpExtensionVideoRotation},
    {"http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01", kRtpExtensionTransportSequenceNumber},
    {"http://www.webrtc.org/experiments/rtp-hdrext/transport-wide-cc-02", kRtpExtensionTransportSequenceNumber02},
    {"http://www.webrtc.org/experiments/rtp-hdrext/playout-delay", kRtpExtensionPlayoutDelay},
    {"http://www.webrtc.org/experiments/rtp-hdrext/video-content-type", kRtpExtensionVideoContentType},
    {"http://www.webrtc.org/experiments/rtp-hdrext/video-layers-allocation00", kRtpExtensionVideoLayersAllocation},
    {"http://www.webrtc.org/experiments/rtp-hdrext/video-timing", kRtpExtensionVideoTiming},
    {"urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id", kRtpExtensionRtpStreamId},
    {"urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id", kRtpExtensionRepairedRtpStreamId},
    {"urn:ietf:params:rtp-hdrext:sdes:mid", kRtpExtensionMid},
    {"http://www.webrtc.org/experiments/rtp-hdrext/generic-frame-descriptor-00", kRtpExtensionGenericFrameDescriptor00},
    {"https://aomediacodec.github.io/av1-rtp-spec/dependency-descriptor-rtp-header-extension", kRtpExtensionGenericFrameDescriptor02},
    {"http://www.webrtc.org/experiments/rtp-hdrext/color-space", kRtpExtensionColorSpace},
    {"http://www.webrtc.org/experiments/rtp-hdrext/video-frame-tracking-id", kRtpExtensionVideoFrameTrackingId}};

void RtpHeaderExtensionCapability::Register(int id, const std::string& uri) {
  auto result = UriRTPHeaderExtensionMap.find(uri);
  if (result != UriRTPHeaderExtensionMap.end()) {
    type_id_map_[result->second] = id;
  }
}

std::optional<int> RtpHeaderExtensionCapability::GetTypeId(RTPHeaderExtensionType type) {
  auto result = type_id_map_.find(type);
  if (result != type_id_map_.end())
    return result->second;
  else
    return std::nullopt;
}

std::optional<RTPHeaderExtensionType> RtpHeaderExtensionCapability::GetIdType(int id) {
  auto result = std::find_if(type_id_map_.begin(), type_id_map_.end(), [id](auto& item) { return item.second == id; });
  if (result == type_id_map_.end())
    return std::nullopt;
  return result->first;
}

std::optional<std::string> RtpMidExtension::Parse(uint8_t* data, size_t size) {
  std::string mid;
  if (size == 0 || data[0] == 0)
    return std::nullopt;
  return mid.assign((char*)data, size);
}

std::optional<uint32_t> RtpStreamIdExtension::Parse(uint8_t* data, size_t size) {
  uint32_t rtp_stream_id;
  if (size == 0 || data[0] == 0)
    return std::nullopt;
  rtp_stream_id = ::atoi(reinterpret_cast<char*>(data));
  if (rtp_stream_id == 0)
    return std::nullopt;
  return rtp_stream_id;
}

std::optional<uint32_t> RepairedRtpStreamIdExtension::Parse(uint8_t* data, size_t size) {
  uint32_t repaired_rtp_stream_id;
  if (size == 0 || data[0] == 0)
    return std::nullopt;
  repaired_rtp_stream_id = ::atoi(reinterpret_cast<char*>(data));
  if (repaired_rtp_stream_id == 0)
    return std::nullopt;
  return repaired_rtp_stream_id;
}

std::optional<uint16_t> TransportSequenceNumberExtension::Parse(uint8_t* data, size_t size) {
  if (size != kValueSizeBytes)
    return std::nullopt;
  return LoadUInt16BE(data);
}

bool TransportSequenceNumberExtension::Serialize(uint8_t* data, size_t size, uint16_t transport_sequence_number) {
  if (size != kValueSizeBytes)
    return false;
  StoreUInt16BE(data, transport_sequence_number);
  return true;
}