#pragma once

#include <cstddef>
#include <set>
#include <vector>

#include "byte_buffer.h"

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

enum FeedbackRtpMessageType { kNack = 1 };

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
  void SetSenderSsrc(uint32_t ssrc) {
    sender_ssrc_ = ssrc;
  }
  uint32_t SenderSsrc() const {
    return sender_ssrc_;
  }
  static bool IsRtcp(uint8_t* data, size_t size);

 protected:
  static constexpr size_t kHeaderLength = 4;
  bool ParseCommonHeader(ByteReader* byte_reader);
  bool SerializeCommonHeader(ByteWriter* byte_writer);
  RtcpCommonHeader header_;
  uint32_t sender_ssrc_ = 0;
};

struct ReportBlock {
  static const size_t kLength = 24;
  uint32_t source_ssrc;
  uint8_t fraction_lost;
  uint32_t cumulative_lost;  // TODO FIXME :Signed 24-bit value
  uint32_t extended_high_seq_num;
  uint32_t jitter;
  uint32_t last_sr;
  uint32_t delay_since_last_sr;
};

class SenderReportPacket : public RtcpPacket {
 public:
  bool Serialize(ByteWriter* byte_writer);

  void SetSenderSsrc(uint32_t sender_ssrc);

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

class ReceiverReportPacket : public RtcpPacket {
 public:
  bool Parse(ByteReader* byte_reader);

  std::vector<ReportBlock> GetReportBlocks() const;

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
  uint32_t GetMediaSsrc();
  uint32_t MediaSsrc() const {
    return media_ssrc_;
  }
  void SetMediaSsrc(uint32_t media_ssrc) {
    media_ssrc_ = media_ssrc;
  }

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