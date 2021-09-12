#pragma

#include <cstddef>
#include <cstdint>
#include <cstring>
#include <string>
#include <optional>
#include <unordered_map>

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

class RtpExtensionTypeIdManager {
 public:
  void Register(int id, const std::string& uri);
  std::optional<int> GetTypeId(RTPHeaderExtensionType type);
 private:
  std::unordered_map<RTPHeaderExtensionType, int> type_id_map_;
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

class TransportSequenceNumberExtension {
 public:
   using value_type = uint16_t;
   static constexpr uint8_t kValueSizeBytes = 2;
   static std::optional<uint16_t> Parse(uint8_t* data, size_t size);
   static bool Write(uint8_t* data, size_t size, uint16_t transport_sequence_number);
};
