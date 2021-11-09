#include "rtp_packet.h"

#include "byte_buffer.h"
#include "rtp_utils.h"
#include "spdlog/spdlog.h"
#include "utils.h"

RtpPacket::RtpPacket() {

}

RtpPacket::RtpPacket(const RtpPacket& other) {
  this->marker_ = other.marker_;
  this->payload_type_ = other.payload_type_;
  this->padding_size_ = other.padding_size_;
  this->sequence_number_ = other.sequence_number_;
  this->timestamp_ = other.timestamp_;
  this->ssrc_ = other.ssrc_;
  this->payload_offset_ = other.payload_offset_;
  this->payload_size_ = other.payload_size_;
  this->extension_entries_ = other.extension_entries_;
  this->extensions_size_ = other.extensions_size_;
  this->payload_info_ = other.payload_info_;
  data_ = std::make_unique<uint8_t[]>(other.Size());
  memcpy(data_.get(), other.Data(), other.Size());
}

RtpPacket::~RtpPacket() {
}

void RtpPacket::SetMarker(bool marker_bit) {
  marker_ = marker_bit;
  if (marker_) {
    data_[1] = *(data_.get()+ 1) | 0x80;
  } else {
    data_[1] = *(data_.get() + 1) & 0x7F;
  }
}

void RtpPacket::SetPayloadType(uint8_t payload_type) {
  payload_type_ = payload_type;
  data_[1] = (data_[1] & 0x80) | payload_type;
}

void RtpPacket::SetSequenceNumber(uint16_t seq_no) {
  sequence_number_ = seq_no;
  StoreUInt16BE(data_.get() + 2, seq_no);
}

void RtpPacket::SetTimestamp(uint32_t timestamp) {
  timestamp_ = timestamp;
  StoreUInt32BE(data_.get() + 4, timestamp);
}

void RtpPacket::SetSsrc(uint32_t ssrc) {
  ssrc_ = ssrc;
  StoreUInt32BE(data_.get() + 8, ssrc);
}

bool RtpPacket::Marker() const {
  return marker_;
}
uint8_t RtpPacket::PayloadType() const {
  return payload_type_;
}
uint16_t RtpPacket::SequenceNumber() const {
  return sequence_number_;
}
uint32_t RtpPacket::Timestamp() const {
  return timestamp_;
}
uint32_t RtpPacket::Ssrc() const {
  return ssrc_;
}

bool RtpPacket::Parse(const uint8_t* buffer, size_t size) {
  if (size < kMinRtpPacketLen) {
    return false;
  }
  const uint8_t version = buffer[0] >> 6;
  if (version != kRtpVersion) {
    return false;
  }
  const bool has_padding = (buffer[0] & 0x20) != 0;
  const bool has_extension = (buffer[0] & 0x10) != 0;
  const uint8_t number_of_crcs = buffer[0] & 0x0f;
  marker_ = (buffer[1] & 0x80) != 0;
  payload_type_ = buffer[1] & 0x7f;

  sequence_number_ = LoadUInt16BE(&buffer[2]);
  timestamp_ = LoadUInt32BE(&buffer[4]);
  ssrc_ = LoadUInt32BE(&buffer[8]);
  if (size < kMinRtpPacketLen + number_of_crcs * 4) {
    return false;
  }
  payload_offset_ = kMinRtpPacketLen + number_of_crcs * 4;

  if (has_padding) {
    padding_size_ = buffer[size - 1];
    if (padding_size_ == 0) {
      spdlog::warn("Padding was set, but padding size is zero");
      return false;
    }
  } else {
    padding_size_ = 0;
  }

  extensions_size_ = 0;
  extension_entries_.clear();
  if (has_extension) {
    /* RTP header extension, RFC 3550.
     0                   1                   2                   3
     0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    |      defined by profile       |           length              |
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    |                        header extension                       |
    |                             ....                              |
    */
    size_t extension_offset = payload_offset_ + 4;
    if (extension_offset > size) {
      return false;
    }
    uint16_t profile = LoadUInt16BE(&buffer[payload_offset_]);
    size_t extensions_capacity = LoadUInt16BE(&buffer[payload_offset_ + 2]);
    extensions_capacity *= 4;
    if (extension_offset + extensions_capacity > size) {
      return false;
    }
    if (profile != kOneByteExtensionProfileId && (profile & kTwobyteExtensionProfileIdAppBitsFilter) != kTwoByteExtensionProfileId) {
      spdlog::warn("Unsupported rtp extension {}.", profile);
    } else {
      size_t extension_header_length = profile == kOneByteExtensionProfileId ? kOneByteExtensionHeaderLength : kTwoByteExtensionHeaderLength;
      constexpr uint8_t kPaddingByte = 0;
      constexpr uint8_t kPaddingId = 0;
      constexpr uint8_t kOneByteHeaderExtensionReservedId = 15;
      while (extensions_size_ + extension_header_length < extensions_capacity) {
        if (buffer[extension_offset + extensions_size_] == kPaddingByte) {
          extensions_size_++;
          continue;
        }
        int id;
        uint8_t length;
        if (profile == kOneByteExtensionProfileId) {
          id = buffer[extension_offset + extensions_size_] >> 4;
          length = 1 + (buffer[extension_offset + extensions_size_] & 0xf);
          if (id == kOneByteHeaderExtensionReservedId || (id == kPaddingId && length != 1)) {
            break;
          }
        } else {
          id = buffer[extension_offset + extensions_size_];
          length = buffer[extension_offset + extensions_size_ + 1];
        }

        if (extensions_size_ + extension_header_length + length > extensions_capacity) {
          spdlog::warn("Oversized rtp header extension.");
          break;
        }

        ExtensionInfo& extension_info = FindOrCreateExtensionInfo(id);
        if (extension_info.length != 0) {
          spdlog::warn("Duplicate rtp header extension id {}. Overwriting", id);
        }

        size_t offset = extension_offset + extensions_size_ + extension_header_length;
        extension_info.offset = static_cast<uint16_t>(offset);
        extension_info.length = length;
        extension_info.header_length = extension_header_length;
        extensions_size_ += extension_header_length + length;
      }
    }
    payload_offset_ = extension_offset + extensions_capacity;
  }

  if (payload_offset_ + padding_size_ > size) {
    return false;
  }
  payload_size_ = size - payload_offset_ - padding_size_;
  return true;
}

RtpPacket::ExtensionInfo& RtpPacket::FindOrCreateExtensionInfo(int id) {
  for (ExtensionInfo& extension : extension_entries_) {
    if (extension.id == id) {
      return extension;
    }
  }
  extension_entries_.emplace_back(id);
  return extension_entries_.back();
}

bool RtpPacket::Create(uint8_t* buffer, size_t size) {
  if (!Parse(buffer, size)) {
    return false;
  }

  data_.reset(new uint8_t[size]);
  memcpy(data_.get(), buffer, size);
  return true;
}

size_t RtpPacket::Size() const {
  return payload_offset_ + payload_size_ + padding_size_;
}

uint8_t* RtpPacket::Data() const {
  return data_.get();
}

size_t RtpPacket::PayloadSize() const {
  return payload_size_;
}

uint8_t* RtpPacket::Payload() const {
  return data_.get() + payload_offset_;
}

size_t RtpPacket::HeaderSize() const {
  return payload_offset_;
}

bool RtpPacket::IsKeyFrame() const {
  return payload_info_.frame_type == VideoFrameType::kVideoFrameKey;
}

void RtpPacket::SetExtensionCapability(const RtpHeaderExtensionCapability& extension_capability) {
  extension_capability_ = extension_capability;
}

void RtpPacket::UpdateExtensionCapability(RtpHeaderExtensionCapability new_capability) {
  for (auto& entry : extension_entries_) {
    auto type = extension_capability_.GetIdType(entry.id);
    if (!type)
      continue;
    auto expect_id = new_capability.GetTypeId(*type);
    if (*expect_id != entry.id) {
      if (entry.header_length == kOneByteExtensionHeaderLength) {
        uint16_t header_offset = entry.offset - kOneByteExtensionHeaderLength;
        data_[header_offset] &= 0xf;
        data_[header_offset] |= *expect_id << 4;
      }
      else if (entry.header_length == kTwoByteExtensionHeaderLength) {
        uint16_t header_offset = entry.offset - kTwoByteExtensionHeaderLength;
        data_[header_offset] = *expect_id;
      }
      else {
        assert(false);
      }
      entry.id = *expect_id;
    }
  }
  extension_capability_ = new_capability;
}

void RtpPacket::RtxRepaire(uint16_t sequence_number, uint8_t payload_type, uint32_t ssrc) {
  if (payload_size_ == 0)
    return;
  SetPayloadType(payload_type);
  SetSequenceNumber(sequence_number);
  SetSsrc(ssrc);
  std::memmove(data_.get() + payload_offset_, data_.get() + payload_offset_ + kRtxHeaderSize, payload_size_ - kRtxHeaderSize);
  if (padding_size_ != 0) {
    padding_size_ += 2;
    data_[payload_offset_ + payload_size_ + padding_size_ - 1] += 2;
  }
  payload_size_ -= kRtxHeaderSize;
}

bool RtpPacket::ParsePayload(std::string_view codec) {
  if (payload_size_ == 0)
    return true;
  auto result = RtpPayloadParser::Parse(codec, data_.get() + payload_offset_, payload_size_);
  if (!result)
    return false;
  payload_info_ = *result;
  return true;
}