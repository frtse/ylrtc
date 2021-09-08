#include "rtp_header_extension.h"

#include "byte_buffer.h"

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

void IdRtpExtensionTypeManager::Register(int id, const std::string& uri) {
  auto result = UriRTPHeaderExtensionMap.find(uri);
  if (result != UriRTPHeaderExtensionMap.end()) {
    id_type_map_[id] = result->second;
  }
}

RTPHeaderExtensionType IdRtpExtensionTypeManager::GetIdType(int id) {
  auto result = id_type_map_.find(id);
  if (result != id_type_map_.end())
    return result->second;
  else
    return kRtpExtensionNone;
}

bool RtpStreamIdExtension::Parse(uint8_t* data, size_t size) {
  if (size == 0 || data[0] == 0)  // Valid string extension can't be empty.
    return false;
  const char* cstr = reinterpret_cast<const char*>(data);
  // If there is a \0 character in the middle of the `data`, treat it as end
  // of the string. Well-formed string extensions shouldn't contain it.
  rid_.assign(cstr, strnlen(cstr, size));
  return true;
}

const std::string& RtpStreamIdExtension::RtpStreamId() const {
  return rid_;
}

bool RepairedRtpStreamIdExtension::Parse(uint8_t* data, size_t size) {
  if (size == 0 || data[0] == 0)  // Valid string extension can't be empty.
    return false;
  const char* cstr = reinterpret_cast<const char*>(data);
  // If there is a \0 character in the middle of the `data`, treat it as end
  // of the string. Well-formed string extensions shouldn't contain it.
  rrid_.assign(cstr, strnlen(cstr, size));
  return true;
}

const std::string& RepairedRtpStreamIdExtension::RepairedRtpStreamId() const {
  return rrid_;
}

std::optional<uint16_t> TransportSequenceNumberExtension::Parse(uint8_t* data, size_t size) {
  if (size != kValueSizeBytes)
    return std::nullopt;
  return LoadUInt16BE(data);
}

bool TransportSequenceNumberExtension::Write(uint8_t* data, size_t size, uint16_t transport_sequence_number) {
  if (size != kValueSizeBytes)
    return false;
  StoreUInt16BE(data, transport_sequence_number);
  return true;
}