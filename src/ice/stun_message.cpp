#include "stun_message.h"

#include "byte_buffer.h"
#include "crc32.h"
#include "hmac_sha1.h"
#include "spdlog/spdlog.h"
#include "utils.h"

StunMessage::StunMessage(std::string local_ufrag, std::string local_password, std::string remote_ufrag)
    : mapped_endpoint_{nullptr}, has_use_candidate_{false}, local_ufrag_{local_ufrag}, local_password_{local_password}, remote_ufrag_{remote_ufrag} {}

bool StunMessage::Parse(uint8_t* data, size_t size) {
  ByteReader reader(data, size);
  uint16_t type;
  uint16_t length;
  uint32_t magic_cookie;
  bool has_message_integrity = false;
  const uint8_t* message_integrity_start_address = nullptr;

  if (!reader.ReadUInt16(&type))
    return false;
  if (!reader.ReadUInt16(&length))
    return false;
  if (!reader.ReadUInt32(&magic_cookie))
    return false;

  if (magic_cookie != kStunMagicCookie)
    return false;
  if (!reader.ReadString(&transaction_id_, kStunTransactionIdLength))
    return false;

  bool has_fingerprint = false;
  while (reader.Left() > 0) {
    uint16_t attr_type, attr_length;
    if (!reader.ReadUInt16(&attr_type))
      return false;
    if (!reader.ReadUInt16(&attr_length))
      return false;
    switch (attr_type) {
      case kAttrUsername: {
        std::string user_name((char*)reader.CurrentData(), attr_length);
        if (user_name != local_ufrag_ + ":" + remote_ufrag_)
          return false;
        break;
      }
      case kAttrMessageIntegrity: {
        has_message_integrity = true;
        message_integrity_start_address = (reader.CurrentData() - kStunAttributeHeaderSize);
        break;
      }
      case kAttrFingerprint: {
        uint32_t announced = LoadUInt32BE(reader.CurrentData());
        uint32_t computed = Crc32::Calculate(data, reader.CurrentData() - data - kStunAttributeHeaderSize) ^ 0x5354554e;
        if (announced != computed)
          return false;
        has_fingerprint = true;
        break;
      }
      case kAttrUseCandidate: {
        has_use_candidate_ = true;
        break;
      }
      Default:;
    }

    if ((attr_length % 4) != 0) {
      attr_length += (4 - (attr_length % 4));
    }
    if (!reader.Consume(attr_length)) {
      return false;
    }
  }

  if (reader.Left() != 0)
    return false;

  if (has_message_integrity) {
    if (has_fingerprint)
      StoreUInt16BE(data + kLengthOffset, size - kStunHeaderSize - kFingerprintAttrLength - kStunAttributeHeaderSize);
    HmacSha1 hmac_sha1;
    auto result = hmac_sha1.Calculate(local_password_, data, message_integrity_start_address - data);
    if (std::memcmp(message_integrity_start_address + kStunAttributeHeaderSize, result, HmacSha1::kSha1ResultLength) != 0)
      return false;
    if (has_fingerprint)
      StoreUInt16BE(data + kLengthOffset, size - kStunHeaderSize);
  }

  return true;
}

bool StunMessage::HasUseCandidate() const {
  return has_use_candidate_;
}

void StunMessage::SetXorMappedAddress(udp::endpoint* address) {
  mapped_endpoint_ = address;
}

bool StunMessage::CreateResponse() {
  size_ = kStunHeaderSize + kStunAttributeHeaderSize + kXorMappedAddressAttributeLength
    + kStunAttributeHeaderSize + kMessageIntegrityAttributeLength + kStunAttributeHeaderSize + kFingerprintAttrLength;
  data_.reset(new uint8_t[size_]);
  ByteWriter writer(data_.get(), size_);

  if (!writer.WriteUInt16(kBindingResponse))
    return false;
  if (!writer.WriteUInt16(size_ - kStunHeaderSize))
    return false;
  if (!writer.WriteUInt32(kStunMagicCookie))
    return false;
  if (!writer.WriteString(transaction_id_))
    return false;

  if (mapped_endpoint_) {
    if (mapped_endpoint_->protocol() == udp::v4()) {
      boost::asio::ip::address_v4 address = mapped_endpoint_->address().to_v4();
      if (!writer.WriteUInt16(kAttrXorMappedAddress))
        return false;
      if (!writer.WriteUInt16(kXorMappedAddressAttributeLength))
        return false;
      // The first 8 bits are used for alignment purposes and are ignored.
      if (!writer.WriteUInt8(0))
        return false;
      // IPv4.
      if (!writer.WriteUInt8(0x01))
        return false;
      if (!writer.WriteUInt16(mapped_endpoint_->port() ^ (kStunMagicCookie >> 16)))
        return false;
      if (!writer.WriteUInt32(address.to_uint() ^ kStunMagicCookie))
        return false;
    } else if (mapped_endpoint_->protocol() == udp::v6()) {
      // TODO: Support ipv6.
    } else {
      // Protocol not supported.
      return false;
    }
  }

  StoreUInt16BE(data_.get() + 2, kStunAttributeHeaderSize + kXorMappedAddressAttributeLength
    + kStunAttributeHeaderSize + kMessageIntegrityAttributeLength);
  HmacSha1 hmac_sha1;
  auto result = hmac_sha1.Calculate(local_password_, writer.Data(), writer.Used());

  if (!writer.WriteUInt16(kAttrMessageIntegrity))
    return false;
  if (!writer.WriteUInt16(HmacSha1::kSha1ResultLength))
    return false;
  if (!writer.WriteBytes((char*)result, HmacSha1::kSha1ResultLength))
    return false;

  StoreUInt16BE(data_.get() + 2, kStunAttributeHeaderSize + kXorMappedAddressAttributeLength
    + kStunAttributeHeaderSize + kMessageIntegrityAttributeLength + kStunAttributeHeaderSize + kFingerprintAttrLength);

  uint32_t crc32 = Crc32::Calculate(writer.Data(), writer.Used());
  if (!writer.WriteUInt16(kAttrFingerprint))
    return false;
  if (!writer.WriteUInt16(kFingerprintAttrLength))
    return false;
  if (!writer.WriteUInt32(crc32 ^ 0x5354554e))
    return false;

  return true;
}

uint8_t* StunMessage::Data() const {
  return data_.get();
};

size_t StunMessage::Size() const {
  return size_;
}
