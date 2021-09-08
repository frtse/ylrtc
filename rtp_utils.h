#pragma once

#include <cstddef>
#include <cstdint>
#include <optional>

constexpr size_t kMinRtpPacketLen = 12;
constexpr uint8_t kRtpVersion = 2;
constexpr uint16_t kOneByteExtensionProfileId = 0xBEDE;
constexpr uint16_t kTwoByteExtensionProfileId = 0x1000;
constexpr uint16_t kTwobyteExtensionProfileIdAppBitsFilter = 0xfff0;
constexpr size_t kOneByteExtensionHeaderLength = 1;
constexpr size_t kTwoByteExtensionHeaderLength = 2;
constexpr size_t kDefaultPacketSize = 1500;
constexpr size_t kRtxHeaderSize = 2;
const size_t kRtpExtensionHeaderLen = 4;

bool IsRtpPacket(uint8_t* data, size_t len);
std::optional<uint32_t> GetRtpSsrc(uint8_t* data, size_t size);
void SetRtpSsrc(uint8_t* data, size_t size, uint32_t ssrc);
void SetPayloadType(uint8_t* data, size_t size, uint8_t payload_type);
void SetSequenceNumber(uint8_t* data, size_t size, uint16_t seq_no);

std::optional<size_t> GetRtpHeaderLength(const uint8_t* rtp, size_t length);
