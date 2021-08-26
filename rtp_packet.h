#pragma once

#include <cstddef>
#include <cstdint>
#include <memory>
#include <type_traits>
#include <vector>

static bool IsRtpPacket(uint8_t* data, size_t len) {
  return len >= 12              // Min size 12.
         && data[0] >> 6 == 2;  // Version 2.
}

//  0                   1                   2                   3
//  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// |V=2|P|X|  CC   |M|     PT      |       sequence number         |
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// |                           timestamp                           |
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// |           synchronization source (SSRC) identifier            |
// +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
// |            Contributing source (CSRC) identifiers             |
// |                             ....                              |
// +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
// |  header eXtension profile id  |       length in 32bits        |
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// |                          Extensions                           |
// |                             ....                              |
// +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
// |                           Payload                             |
// |             ....              :  padding...                   |
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// |               padding         | Padding size  |
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

constexpr size_t kFixedHeaderSize = 12;
constexpr uint8_t kRtpVersion = 2;
constexpr uint16_t kOneByteExtensionProfileId = 0xBEDE;
constexpr uint16_t kTwoByteExtensionProfileId = 0x1000;
constexpr uint16_t kTwobyteExtensionProfileIdAppBitsFilter = 0xfff0;
constexpr size_t kOneByteExtensionHeaderLength = 1;
constexpr size_t kTwoByteExtensionHeaderLength = 2;
constexpr size_t kDefaultPacketSize = 1500;

class RtpPacket {
 public:
  ~RtpPacket();
  bool Create(const uint8_t* buffer, size_t size);
  bool CreateFromExistingMemory(uint8_t* buffer, size_t size);

  void SetMarker(bool marker_bit);
  void SetPayloadType(uint8_t payload_type);
  void SetSequenceNumber(uint16_t seq_no);
  void SetTimestamp(uint32_t timestamp);
  void SetSsrc(uint32_t ssrc);

  bool Marker() const;
  uint8_t PayloadType() const;
  uint16_t SequenceNumber() const;
  uint32_t Timestamp() const;
  uint32_t Ssrc() const;
  size_t Size() const;
  uint8_t* Data() const;

 private:
  struct ExtensionInfo {
    explicit ExtensionInfo(uint8_t id) : ExtensionInfo(id, 0, 0) {}
    ExtensionInfo(uint8_t id, uint8_t length, uint16_t offset)
        : id(id), length(length), offset(offset) {}
    uint8_t id;
    uint8_t length;
    uint16_t offset;
  };
  ExtensionInfo& FindOrCreateExtensionInfo(int id);
  bool Parse(const uint8_t* buffer, size_t size);

  bool marker_;
  uint8_t payload_type_;
  uint8_t padding_size_;
  uint16_t sequence_number_;
  uint32_t timestamp_;
  uint32_t ssrc_;
  size_t payload_offset_;  // Match header size with csrcs and extensions.
  size_t payload_size_;
  std::vector<ExtensionInfo> extension_entries_;
  size_t extensions_size_ = 0;  // Unaligned.
  uint8_t* data_{nullptr};
  size_t size_;
  bool owned_memory_{false};
};