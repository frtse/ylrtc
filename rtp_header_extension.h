#pragma

#include <unordered_map>
#include <string>
#include <cstring>
#include <cstdint>
#include <cstddef>

enum RTPHeaderExtensionType : int {
  kRtpExtensionNone,
  kRtpExtensionTransmissionTimeOffset,
  kRtpExtensionAudioLevel,
  kRtpExtensionCsrcAudioLevel,
  kRtpExtensionInbandComfortNoise,
  kRtpExtensionAbsoluteSendTime,
  kRtpExtensionAbsoluteCaptureTime,
  kRtpExtensionVideoRotation,
  kRtpExtensionTransportSequenceNumber,
  kRtpExtensionTransportSequenceNumber02,
  kRtpExtensionPlayoutDelay,
  kRtpExtensionVideoContentType,
  kRtpExtensionVideoLayersAllocation,
  kRtpExtensionVideoTiming,
  kRtpExtensionRtpStreamId,
  kRtpExtensionRepairedRtpStreamId,
  kRtpExtensionMid,
  kRtpExtensionGenericFrameDescriptor00,
  kRtpExtensionGenericFrameDescriptor = kRtpExtensionGenericFrameDescriptor00,
  kRtpExtensionGenericFrameDescriptor02,
  kRtpExtensionColorSpace,
  kRtpExtensionVideoFrameTrackingId,
  kRtpExtensionNumberOfExtensions  // Must be the last entity in the enum.
};

class IdRtpExtensionTypeManager {
 public:
  void Register(int id, const std::string& uri);
  RTPHeaderExtensionType GetIdType(int id);
 private:
  std::unordered_map<int, RTPHeaderExtensionType> id_type_map_;
};

class RtpStreamIdExtension {
 public:
  bool Parse(uint8_t* data, size_t size);
  const std::string& RtpStreamId() const;
 private:
  std::string rid_;
};

class RepairedRtpStreamIdExtension {
 public:
  bool Parse(uint8_t* data, size_t size);
  const std::string& RepairedRtpStreamId() const;
 private:
  std::string rrid_;
};

