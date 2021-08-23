#pragma once

#include <boost/asio.hpp>
#include <cstddef>
#include <cstdint>
#include <memory>
#include <string>

using udp = boost::asio::ip::udp;

// The mask used to determine whether a STUN message is a request/response etc.
const uint32_t kStunTypeMask = 0x0110;

// STUN Attribute header length.
const size_t kStunAttributeHeaderSize = 4;

// Following values correspond to RFC5389.
const size_t kStunHeaderSize = 20;
const size_t kStunTransactionIdLength = 12;
const uint32_t kStunMagicCookie = 0x2112A442;
const uint32_t kLengthOffset = 2;
const uint32_t kFingerprintAttrLength = 4;
constexpr size_t kStunMagicCookieLength = sizeof(kStunMagicCookie);

class StunMessage {
 public:
  enum Type : uint16_t {
    kBindingRrequst = 0x0001,
    kBindingIndication = 0x0011,
    kBindingResponse = 0x0101,
    kBindingErrorResponse = 0x0111,
  };

  enum Attribute : uint16_t {
    kAttrMappedAddress = 0x0001,
    kAttrUsername = 0x0006,
    kAttrMessageIntegrity = 0x0008,
    kAttrUnknownAttributes = 0x000a,
    kAttrXorMappedAddress = 0x0020,
    kAttrUseCandidate = 0x0025,
    kAttrFingerprint = 0x8028,
    kAttrIceControlled = 0x8029,
    kAttrICEControlling = 0x802A
  };

  StunMessage(std::string local_ufrag, std::string local_password, std::string remote_ufrag);
  bool Parse(uint8_t* data, size_t size);
  void SetXorMappedAddress(udp::endpoint* address);
  bool CreateResponse();
  uint8_t* Data() const;
  size_t Size() const;
  bool HasUseCandidate() const;

  static bool IsStun(uint8_t* data, size_t size);

 private:
  std::string transaction_id_;
  udp::endpoint* mapped_endpoint_;
  std::unique_ptr<uint8_t[]> data_;
  size_t size_;
  bool has_use_candidate_;
  std::string local_ufrag_;
  std::string local_password_;
  std::string remote_ufrag_;
};