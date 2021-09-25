#pragma once

#include <cstddef>
#include <set>
#include <vector>

#include "byte_buffer.h"

constexpr int32_t kDefaultVideoReportInterval = 1000;  // millis.
constexpr int32_t kDefaultAudioReportInterval = 5000;  // millis.

enum { kRtcpExpectedVersion = 2, kRtcpMinHeaderLength = 4 };

enum RtcpType {
  kRtcpTypeFir = 192,
  kRtcpTypeSr = 200,
  kRtcpTypeRr = 201,
  kRtcpTypeSdes = 202,
  kRtcpTypeBye = 203,
  kRtcpTypeApp = 204,
  kRtcpTypeRtpfb = 205,
  kRtcpTypePsfb = 206,
  kRtcpTypeXr = 207,
};

enum FeedbackPsMessageType { kPli = 1, kFir = 4 };

enum FeedbackRtpMessageType { kNack = 1, kTwcc = 15 };

//    0                   1           1       2                   3
//    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 0 |V=2|P|   C/F   |
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 1                 |  Packet Type  |
//   ----------------+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 2                                 |             length            |
//   --------------------------------+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//
// Common header for all RTCP packets, 4 octets.
struct RtcpCommonHeader {
  uint8_t count_or_format : 5;
  uint8_t padding : 1;
  uint8_t version : 2;
  uint8_t packet_type : 8;
  uint16_t length : 16;
};

class RtcpPacket {
 public:
  virtual ~RtcpPacket() = default;
  virtual bool Parse(ByteReader* byte_reader);
  virtual bool Serialize(ByteWriter* byte_writer) {
    return true;
  };

  uint8_t Type() const;
  uint8_t Format() const;
  uint8_t Count() const;
  void SetSenderSsrc(uint32_t ssrc);
  uint32_t SenderSsrc() const;
  static bool IsRtcp(uint8_t* data, size_t size);

 protected:
  static constexpr size_t kHeaderLength = 4;
  bool ParseCommonHeader(ByteReader* byte_reader);
  bool SerializeCommonHeader(ByteWriter* byte_writer);
  RtcpCommonHeader header_;
  uint32_t sender_ssrc_ = 0;
};

// From RFC 3550, RTP: A Transport Protocol for Real-Time Applications.
//
// RTCP report block (RFC 3550).
//
//     0                   1                   2                   3
//     0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//    +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
//  0 |                 SSRC_1 (SSRC of first source)                 |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  4 | fraction lost |       cumulative number of packets lost       |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  8 |           extended highest sequence number received           |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 12 |                      interarrival jitter                      |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 16 |                         last SR (LSR)                         |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 20 |                   delay since last SR (DLSR)                  |
// 24 +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
struct ReportBlock {
 public:
  static constexpr size_t kLength = 24;
  void SetMediaSsrc(uint32_t ssrc) {
     source_ssrc_ = ssrc;
  }
  void SetFractionLost(uint8_t fraction_lost) {
    fraction_lost_ = fraction_lost;
  }
  void SetCumulativeLost(uint32_t cumulative_lost) {
    cumulative_lost_ = cumulative_lost;
  }
  void SetExtHighestSeqNum(uint32_t ext_highest_seq_num) {
    extended_high_seq_num_ = ext_highest_seq_num;
  }
  void SetJitter(uint32_t jitter) {
    jitter_ = jitter;
  }
  void SetLastSr(uint32_t last_sr) {
    last_sr_ = last_sr;
  }
  void SetDelayLastSr(uint32_t delay_last_sr) {
    delay_since_last_sr_ = delay_last_sr;
  }

  uint32_t MediaSsrc() const {
    return source_ssrc_;
  }
  uint8_t FractionLost() const {
    return fraction_lost_;
  }
  uint32_t CumulativeLost() const {
    return cumulative_lost_;
  }
  uint32_t ExtHighestSeqNum() const {
    return extended_high_seq_num_;
  }
  uint32_t Jitter() const {
    return jitter_;
  }
  uint32_t LastSr() const {
    return last_sr_;
  }
  uint32_t DelayLastSr() const {
    return delay_since_last_sr_;
  }
  bool Parse(ByteReader* byte_reader) {
    if (!byte_reader) // TODO assert
      return false;
    if (!byte_reader->ReadUInt32(&source_ssrc_))
      return false;
    if (!byte_reader->ReadUInt8(&fraction_lost_))
      return false;
    if (!byte_reader->ReadUInt24(&cumulative_lost_))
      return false;
    if (!byte_reader->ReadUInt32(&extended_high_seq_num_))
      return false;
    if (!byte_reader->ReadUInt32(&jitter_))
      return false;
    if (!byte_reader->ReadUInt32(&last_sr_))
      return false;
    if (!byte_reader->ReadUInt32(&delay_since_last_sr_))
      return false;
    return true;
  }
  bool Serialize(ByteWriter* byte_writer) {
    if (!byte_writer) // TODO assert
      return false;
    if (!byte_writer->WriteUInt32(source_ssrc_))
      return false;
    if (!byte_writer->WriteUInt8(fraction_lost_))
      return false;
    if (!byte_writer->WriteUInt24(cumulative_lost_))
      return false;
    if (!byte_writer->WriteUInt32(extended_high_seq_num_))
      return false;
    if (!byte_writer->WriteUInt32(jitter_))
      return false;
    if (!byte_writer->WriteUInt32(last_sr_))
      return false;
    if (!byte_writer->WriteUInt32(delay_since_last_sr_))
      return false;
    return true;
  }
 private:
  uint32_t source_ssrc_{0};     // 32 bits
  uint8_t fraction_lost_{0};    // 8 bits representing a fixed point value 0..1
  uint32_t cumulative_lost_{0};  // TODO: Signed 24-bit value
  uint32_t extended_high_seq_num_{0};  // 32 bits
  uint32_t jitter_{0};                 // 32 bits
  uint32_t last_sr_{0};                // 32 bits
  uint32_t delay_since_last_sr_{0};    // 32 bits, units of 1/65536 seconds
};

//    Sender report (SR) (RFC 3550).
//     0                   1                   2                   3
//     0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//    |V=2|P|    RC   |   PT=SR=200   |             length            |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  0 |                         SSRC of sender                        |
//    +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
//  4 |              NTP timestamp, most significant word             |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  8 |             NTP timestamp, least significant word             |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 12 |                         RTP timestamp                         |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 16 |                     sender's packet count                     |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 20 |                      sender's octet count                     |
// 24 +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
class SenderReportPacket : public RtcpPacket {
 public:
  bool Serialize(ByteWriter* byte_writer);

  void SetNtpSeconds(uint32_t ntp_seconds);

  void SetNtpFractions(uint32_t ntp_fractions);

  void SetRtpTimestamp(uint32_t rtp_timestamp);

  void SetSendPacketCount(uint32_t send_packet_count);

  void SendOctets(uint32_t send_octets);

 private:
  static constexpr size_t kSenderBaseLength = 24;
  uint32_t sender_ssrc_{0};
  uint32_t ntp_seconds_;
  uint32_t ntp_fractions_;
  uint32_t rtp_timestamp_;
  uint32_t send_packet_count_;
  uint32_t send_octets_;
};

// RTCP receiver report (RFC 3550).
//
//   0                   1                   2                   3
//   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  |V=2|P|    RC   |   PT=RR=201   |             length            |
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  |                     SSRC of packet sender                     |
//  +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
//  |                         report block(s)                       |
//  |                            ....                               |
class ReceiverReportPacket : public RtcpPacket {
 public:
  static constexpr size_t kMaxNumberOfReportBlocks = 0x1f;
  bool Parse(ByteReader* byte_reader);
  bool Serialize(ByteWriter* byte_writer);
  std::vector<ReportBlock> GetReportBlocks() const;
  bool SetReportBlocks(const std::vector<ReportBlock>&& blocks);

 protected:
  std::vector<ReportBlock> report_blocks_;
  uint32_t sender_ssrc_{0};
};

// RFC 4585, Section 6.1: Feedback format.
//
// Common packet format:
//
//    0                   1                   2                   3
//    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//   |V=2|P|   FMT   |       PT      |          length               |
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 0 |                  SSRC of packet sender                        |
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 4 |                  SSRC of media source                         |
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//   :            Feedback Control Information (FCI)                 :
//   :                                                               :
class RtcpCommonFeedback : public RtcpPacket {
 public:
  uint32_t MediaSsrc() const;
  void SetMediaSsrc(uint32_t media_ssrc);

 protected:
  static constexpr size_t kCommonFeedbackLength = 8;
  bool ParseCommonFeedback(ByteReader* byte_reader);
  bool SerializeCommonFeedback(ByteWriter* byte_writer) const;
  uint32_t media_ssrc_{0};
};

// RFC 4585, Section 6.1: Feedback format.
//
// Common packet format:
//
//    0                   1                   2                   3
//    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//   |V=2|P|   FMT   |       PT      |          length               |
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 0 |                  SSRC of packet sender                        |
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 4 |                  SSRC of media source                         |
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//   :            Feedback Control Information (FCI)                 :
//   :                                                               :
//
// Picture loss indication (PLI)
// FCI: no feedback control information.
class RtcpPliPacket : public RtcpCommonFeedback {
 public:
  bool Serialize(ByteWriter* byte_writer) override;
};

// RFC 4585: Feedback format.
// Common packet format:
//
//   0                   1                   2                   3
//   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  |V=2|P|   FMT   |       PT      |          length               |
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  |                  SSRC of packet sender                        |
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  |             SSRC of media source (unused) = 0                 |
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  :            Feedback Control Information (FCI)                 :
//  :                                                               :
// Full intra request (FIR) (RFC 5104).
// The Feedback Control Information (FCI) for the Full Intra Request
// consists of one or more FCI entries.
// FCI:
//   0                   1                   2                   3
//   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  |                              SSRC                             |
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  | Seq nr.       |    Reserved = 0                               |
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
class RtcpFirPacket : public RtcpCommonFeedback {
 public:
  struct FciEntry {
    FciEntry() : ssrc(0), seq_nr(0) {}
    FciEntry(uint32_t ssrc, uint8_t seq_nr) : ssrc(ssrc), seq_nr(seq_nr) {}
    uint32_t ssrc;
    uint8_t seq_nr;
  };

  bool Serialize(ByteWriter* byte_writer) override;
  void AddFciEntry(uint32_t ssrc, uint8_t seq_num);

 private:
  std::vector<FciEntry> FCI_;
};

// RFC 4585: Feedback format.
//
// Common packet format:
//
//    0                   1                   2                   3
//    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//   |V=2|P|   FMT   |       PT      |          length               |
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 0 |                  SSRC of packet sender                        |
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 4 |                  SSRC of media source                         |
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//   :            Feedback Control Information (FCI)                 :
//   :                                                               :
//
// Generic NACK (RFC 4585).
//
// FCI:
//    0                   1                   2                   3
//    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//   |            PID                |             BLP               |
//   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
class NackPacket : public RtcpCommonFeedback {
 public:
  bool Parse(ByteReader* byte_reader) override;
  bool Serialize(ByteWriter* byte_writer) override;
  const std::vector<uint16_t>& GetLostPacketSequenceNumbers() const;
  void SetLostPacketSequenceNumbers(std::vector<uint16_t> nack_list);

 private:
  struct PackedNack {
    uint16_t first_pid;
    uint16_t bitmask;
  };
  static constexpr size_t kNackItemLength = 4;
  std::vector<uint16_t> packet_lost_sequence_numbers_;
};

class RtcpCompound {
 public:
  ~RtcpCompound();
  bool Parse(uint8_t* data, int size);
  std::vector<RtcpPacket*> GetRtcpPackets();

 private:
  std::vector<RtcpPacket*> rtcps_;
};