#pragma once

#include <cstddef>
#include <cstdint>
#include <cstring>
#include <optional>
#include <string>
#include <unordered_map>

#include "sdptransform/json.hpp"

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

class RtpHeaderExtensionCapability {
 public:
  void Register(int id, const std::string& uri);
  std::optional<int> GetTypeId(RTPHeaderExtensionType type);
  std::optional<RTPHeaderExtensionType> GetIdType(int id);

 private:
  std::unordered_map<RTPHeaderExtensionType, int> type_id_map_;
};

class ServerSupportRtpExtensionIdMap {
 public:
  static uint32_t GetIdByType(RTPHeaderExtensionType type);
  static nlohmann::json CreateSdpRtpExtensions(const std::string& media_type);

 private:
  static std::unordered_map<RTPHeaderExtensionType, uint32_t> extension_id_map_;
};

class RtpMidExtension {
 public:
  static constexpr RTPHeaderExtensionType kType = kRtpExtensionMid;
  using value_type = std::string;
  static std::optional<std::string> Parse(uint8_t* data, size_t size);
};

class RtpStreamIdExtension {
 public:
  static constexpr RTPHeaderExtensionType kType = kRtpExtensionRtpStreamId;
  using value_type = std::string;
  static std::optional<std::string> Parse(uint8_t* data, size_t size);
};

class RepairedRtpStreamIdExtension {
 public:
  static constexpr RTPHeaderExtensionType kType = kRtpExtensionRepairedRtpStreamId;
  using value_type = std::string;
  static std::optional<std::string> Parse(uint8_t* data, size_t size);
};

class TransportSequenceNumberExtension {
 public:
  static constexpr RTPHeaderExtensionType kType = kRtpExtensionTransportSequenceNumber;
  using value_type = uint16_t;
  static constexpr uint8_t kValueSizeBytes = 2;
  static std::optional<uint16_t> Parse(uint8_t* data, size_t size);
  static bool Serialize(uint8_t* data, size_t size, uint16_t transport_sequence_number);
};
