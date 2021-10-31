#include "rtp_header_extension.h"

#include "utils.h"
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

void RtpExtensionConfigure::Register(int id, const std::string& uri) {
  auto result = UriRTPHeaderExtensionMap.find(uri);
  if (result != UriRTPHeaderExtensionMap.end()) {
    type_id_map_[result->second] = id;
  }
}

std::optional<int> RtpExtensionConfigure::GetTypeId(RTPHeaderExtensionType type) {
  auto result = type_id_map_.find(type);
  if (result != type_id_map_.end())
    return result->second;
  else
    return std::nullopt;
}

std::unordered_map<RTPHeaderExtensionType, uint32_t> ServerSupportRtpExtensionIdMap::extension_id_map_ = {
  {kRtpExtensionMid, 10},
  {kRtpExtensionRtpStreamId, 11},
  {kRtpExtensionRepairedRtpStreamId, 12},
  {kRtpExtensionTransportSequenceNumber, 13},
  {kRtpExtensionAudioLevel, 14}
};

uint32_t ServerSupportRtpExtensionIdMap::GetIdByType(RTPHeaderExtensionType type) {
  if (extension_id_map_.find(type) == extension_id_map_.end())
    ASSERT(false);
  return extension_id_map_.at(type);
}

nlohmann::json ServerSupportRtpExtensionIdMap::CreateSdpRtpExtensions(const std::string& media_type) {
  ASSERT(media_type == "video" || media_type == "audio");
  nlohmann::json extensions = nlohmann::json::array();
  nlohmann::json extension;
  extension["value"] = 10;
  extension["direction"] = "";
  extension["encrypt-uri"] = "";
  extension["config"] = "";
  extension["uri"] = "urn:ietf:params:rtp-hdrext:sdes:mid";
  extensions.push_back(extension);
  extension.clear();
  extension["value"] = 11;
  extension["direction"] = "";
  extension["encrypt-uri"] = "";
  extension["config"] = "";
  extension["uri"] = "urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id";
  extensions.push_back(extension);
  extension.clear();
  extension["value"] = 12;
  extension["direction"] = "";
  extension["encrypt-uri"] = "";
  extension["config"] = "";
  extension["uri"] = "urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id";
  extensions.push_back(extension);
  extension.clear();
  // TODO 
  
  extension["value"] = 13;
  extension["direction"] = "";
  extension["encrypt-uri"] = "";
  extension["config"] = "";
  extension["uri"] = "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01";
  extensions.push_back(extension);
  extension.clear();
  
  if (media_type == "audio") {
    extension["value"] = 14;
    extension["direction"] = "";
    extension["encrypt-uri"] = "";
    extension["config"] = "";
    extension["uri"] = "urn:ietf:params:rtp-hdrext:ssrc-audio-level";
    extensions.push_back(extension);
    extension.clear();
  }
  return extensions;
}

std::optional<std::string> RtpMidExtension::Parse(uint8_t* data, size_t size) {
  std::string mid;
  if (size == 0 || data[0] == 0)  // Valid string extension can't be empty.
    return std::nullopt;
  const char* cstr = reinterpret_cast<const char*>(data);
  // If there is a \0 character in the middle of the `data`, treat it as end
  // of the string. Well-formed string extensions shouldn't contain it.
  mid.assign(cstr, strnlen(cstr, size));
  return mid;
}

std::optional<std::string> RtpStreamIdExtension::Parse(uint8_t* data, size_t size) {
  std::string rtp_stream_id;
  if (size == 0 || data[0] == 0)  // Valid string extension can't be empty.
    return std::nullopt;
  const char* cstr = reinterpret_cast<const char*>(data);
  // If there is a \0 character in the middle of the `data`, treat it as end
  // of the string. Well-formed string extensions shouldn't contain it.
  rtp_stream_id.assign(cstr, strnlen(cstr, size));
  return rtp_stream_id;
}

std::optional<std::string> RepairedRtpStreamIdExtension::Parse(uint8_t* data, size_t size) {
  std::string repaired_rtp_stream_id;
  if (size == 0 || data[0] == 0)  // Valid string extension can't be empty.
    return nullptr;
  const char* cstr = reinterpret_cast<const char*>(data);
  // If there is a \0 character in the middle of the `data`, treat it as end
  // of the string. Well-formed string extensions shouldn't contain it.
  repaired_rtp_stream_id.assign(cstr, strnlen(cstr, size));
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