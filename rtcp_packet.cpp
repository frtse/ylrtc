#include "rtcp_packet.h"

#include <arpa/inet.h>

#include "spdlog/spdlog.h"
#include "transport_feedback.h"
#include "utils.h"

bool RtcpPacket::Parse(ByteReader* byte_reader) {
  if (!ParseCommonHeader(byte_reader))
    return false;

  int payload_len = header_.length * 4;
  if (!byte_reader->Consume(payload_len))
    return false;

  return true;
}

uint8_t RtcpPacket::Type() const {
  return header_.packet_type;
}

uint8_t RtcpPacket::Format() const {
  return header_.count_or_format;
}

uint8_t RtcpPacket::Count() const {
  return header_.count_or_format;
}

void RtcpPacket::SetSenderSsrc(uint32_t ssrc) {
  sender_ssrc_ = ssrc;
}

uint32_t RtcpPacket::SenderSsrc() const {
  return sender_ssrc_;
}

bool RtcpPacket::IsRtcp(uint8_t* data, size_t size) {
  // 72 to 76 is reserved for RTP
  // 77 to 79 is not reserver but  they are not assigned we will block them
  // for RTCP 200 SR  == marker bit + 72
  // for RTCP 204 APP == marker bit + 76
  /*
   *       RTCP
   *
   * FIR      full INTRA-frame request             192     [RFC2032]   supported
   * NACK     negative acknowledgement             193     [RFC2032]
   * IJ       Extended inter-arrival jitter report 195 [RFC-ietf-avt-rtp-toff
   * set-07.txt] http://tools.ietf.org/html/draft-ietf-avt-rtp-toffset-07
   * SR       sender report                        200     [RFC3551]   supported
   * RR       receiver report                      201     [RFC3551]   supported
   * SDES     source description                   202     [RFC3551]   supported
   * BYE      goodbye                              203     [RFC3551]   supported
   * APP      application-defined                  204     [RFC3551]   ignored
   * RTPFB    Transport layer FB message           205     [RFC4585]   supported
   * PSFB     Payload-specific FB message          206     [RFC4585]   supported
   * XR       extended report                      207     [RFC3611]   supported
   */

  /* 205       RFC 5104
   * FMT 1      NACK       supported
   * FMT 2      reserved
   * FMT 3      TMMBR      supported
   * FMT 4      TMMBN      supported
   */

  /* 206      RFC 5104
   * FMT 1:     Picture Loss Indication (PLI)                      supported
   * FMT 2:     Slice Lost Indication (SLI)
   * FMT 3:     Reference Picture Selection Indication (RPSI)
   * FMT 4:     Full Intra Request (FIR) Command                   supported
   * FMT 5:     Temporal-Spatial Trade-off Request (TSTR)
   * FMT 6:     Temporal-Spatial Trade-off Notification (TSTN)
   * FMT 7:     Video Back Channel Message (VBCM)
   * FMT 15:    Application layer FB message
   */

  if (size < kRtcpMinHeaderLength) {
    return false;
  }

  const uint8_t V = data[0] >> 6;
  if (V != kRtcpExpectedVersion) {
    return false;
  }

  const uint8_t payloadType = data[1];
  switch (payloadType) {
    case 192:
      return true;
    case 193:
      // not supported
      // pass through and check for a potential RTP packet
      return false;
    case 195:
    case 200:
    case 201:
    case 202:
    case 203:
    case 204:
    case 205:
    case 206:
    case 207:
      return true;
    default:
      return false;
  }
}

bool RtcpPacket::ParseCommonHeader(ByteReader* byte_reader) {
  ASSERT(byte_reader);
  if (!byte_reader->ReadBytes((char*)&header_, sizeof(RtcpCommonHeader)))
    return false;
  header_.length = ntohs(header_.length);
  return true;
}

bool RtcpPacket::SerializeCommonHeader(ByteWriter* byte_writer) {
  ASSERT(byte_writer);
  header_.length = htons(header_.length);
  if (!byte_writer->WriteBytes((const char*)(&header_), sizeof(RtcpCommonHeader)))
    return false;
  return true;
}

void ReportBlock::SetMediaSsrc(uint32_t ssrc) {
    source_ssrc_ = ssrc;
}

void ReportBlock::SetFractionLost(uint8_t fraction_lost) {
  fraction_lost_ = fraction_lost;
}

void ReportBlock::SetCumulativeLost(uint32_t cumulative_lost) {
  cumulative_lost_ = cumulative_lost;
}

void ReportBlock::SetExtHighestSeqNum(uint32_t ext_highest_seq_num) {
  extended_high_seq_num_ = ext_highest_seq_num;
}

void ReportBlock::SetJitter(uint32_t jitter) {
  jitter_ = jitter;
}

void ReportBlock::SetLastSr(uint32_t last_sr) {
  last_sr_ = last_sr;
}

void ReportBlock::SetDelayLastSr(uint32_t delay_last_sr) {
  delay_since_last_sr_ = delay_last_sr;
}

uint32_t ReportBlock::MediaSsrc() const {
  return source_ssrc_;
}

uint8_t ReportBlock::FractionLost() const {
  return fraction_lost_;
}

uint32_t ReportBlock::CumulativeLost() const {
  return cumulative_lost_;
}

uint32_t ReportBlock::ExtHighestSeqNum() const {
  return extended_high_seq_num_;
}

uint32_t ReportBlock::Jitter() const {
  return jitter_;
}

uint32_t ReportBlock::LastSr() const {
  return last_sr_;
}

uint32_t ReportBlock::DelayLastSr() const {
  return delay_since_last_sr_;
}

bool ReportBlock::Parse(ByteReader* byte_reader) {
  ASSERT(byte_reader);
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

bool ReportBlock::Serialize(ByteWriter* byte_writer) {
  ASSERT(byte_writer);
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

bool SenderReportPacket::Serialize(ByteWriter* byte_writer) {
  ASSERT(byte_writer);
  header_.count_or_format = 0;
  header_.packet_type = kRtcpTypeSr;
  header_.padding = 0;
  header_.version = 2;
  header_.length = (sizeof(header_) + kSenderBaseLength) / 4 - 1;
  if (!SerializeCommonHeader(byte_writer))
    return false;
  if (!byte_writer->WriteUInt32(sender_ssrc_))
    return false;
  if (!byte_writer->WriteUInt32(ntp_seconds_))
    return false;
  if (!byte_writer->WriteUInt32(ntp_fractions_))
    return false;
  if (!byte_writer->WriteUInt32(rtp_timestamp_))
    return false;
  if (!byte_writer->WriteUInt32(send_packet_count_))
    return false;
  if (!byte_writer->WriteUInt32(send_octets_))
    return false;
  return true;
}

void SenderReportPacket::SetNtpSeconds(uint32_t ntp_seconds) {
  ntp_seconds_ = ntp_seconds;
}

void SenderReportPacket::SetNtpFractions(uint32_t ntp_fractions) {
  ntp_fractions_ = ntp_fractions;
}

void SenderReportPacket::SetRtpTimestamp(uint32_t rtp_timestamp) {
  rtp_timestamp_ = rtp_timestamp;
}

void SenderReportPacket::SetSendPacketCount(uint32_t send_packet_count) {
  send_packet_count_ = send_packet_count;
}

void SenderReportPacket::SendOctets(uint32_t send_octets) {
  send_octets_ = send_octets;
}

bool ReceiverReportPacket::Parse(ByteReader* byte_reader) {
  ASSERT(byte_reader);
  if (!ParseCommonHeader(byte_reader))
    return false;
  if (!byte_reader->ReadUInt32(&sender_ssrc_))
    return false;
  for (int i = 0; i < Count(); ++i) {
    ReportBlock block;
    if (!block.Parse(byte_reader))
      return false;
    report_blocks_.push_back(block);
  }
  return true;
}

bool ReceiverReportPacket::Serialize(ByteWriter* byte_writer) {
  ASSERT(byte_writer);
  header_.count_or_format = report_blocks_.size();
  header_.packet_type = kRtcpTypeRr;
  header_.padding = 0;
  header_.version = 2;
  header_.length = (sizeof(header_) + report_blocks_.size() * ReportBlock::kLength) / 4 - 1;
  if (!SerializeCommonHeader(byte_writer))
    return false;
  if (!byte_writer->WriteUInt32(sender_ssrc_))
    return false;
  for (int i = 0; i < report_blocks_.size(); ++i) {
    if (!report_blocks_[i].Serialize(byte_writer))
      return false;
  }
  return true;
}

std::vector<ReportBlock> ReceiverReportPacket::GetReportBlocks() const {
  return report_blocks_;
}

bool ReceiverReportPacket::SetReportBlocks(const std::vector<ReportBlock>&& blocks) {
  if (blocks.size() > kMaxNumberOfReportBlocks) {
    spdlog::warn("Too many report blocks ({}) for receiver report.", blocks.size());
    return false;
  }
  report_blocks_ = std::move(blocks);
  return true;
}

bool RtcpCommonFeedback::ParseCommonFeedback(ByteReader* byte_reader) {
  ASSERT(byte_reader);
  if (!byte_reader->ReadUInt32(&sender_ssrc_))
    return false;
  if (!byte_reader->ReadUInt32(&media_ssrc_))
    return false;
  return true;
}

bool RtcpCommonFeedback::SerializeCommonFeedback(ByteWriter* byte_writer) const {
  ASSERT(byte_writer);
  if (!byte_writer->WriteUInt32(sender_ssrc_))
    return false;
  if (!byte_writer->WriteUInt32(media_ssrc_))
    return false;
  return true;
}

uint32_t RtcpCommonFeedback::MediaSsrc() const {
  return media_ssrc_;
}

void RtcpCommonFeedback::SetMediaSsrc(uint32_t media_ssrc) {
  media_ssrc_ = media_ssrc;
}

bool RtcpPliPacket::Serialize(ByteWriter* byte_writer) {
  ASSERT(byte_writer);
  header_.count_or_format = FeedbackPsMessageType::kPli;
  header_.length = (kHeaderLength + kCommonFeedbackLength) / 4 - 1;
  header_.packet_type = kRtcpTypePsfb;
  header_.version = 2;
  header_.padding = 0;

  if (!SerializeCommonHeader(byte_writer))
    return false;
  if (!SerializeCommonFeedback(byte_writer))
    return false;
  return true;
}

bool RtcpFirPacket::Serialize(ByteWriter* byte_writer) {
  ASSERT(byte_writer);
  header_.count_or_format = FeedbackPsMessageType::kFir;
  header_.length = (kHeaderLength + kCommonFeedbackLength + 8 * FCI_.size()) / 4 - 1;
  header_.packet_type = kRtcpTypePsfb;
  header_.version = 2;
  header_.padding = 0;

  if (!SerializeCommonHeader(byte_writer))
    return false;
  if (!SerializeCommonFeedback(byte_writer))
    return false;
  constexpr uint32_t kReserved = 0;
  for (auto& request : FCI_) {
    byte_writer->WriteUInt32(request.ssrc);
    byte_writer->WriteUInt8(request.seq_nr);
    byte_writer->WriteUInt24(kReserved);
  }
  return true;
}

void RtcpFirPacket::AddFciEntry(uint32_t ssrc, uint8_t seq_num) {
  FCI_.emplace_back(ssrc, seq_num);
}

const std::vector<uint16_t>& NackPacket::GetLostPacketSequenceNumbers() const {
  return packet_lost_sequence_numbers_;
}

void NackPacket::SetLostPacketSequenceNumbers(std::vector<uint16_t> nack_list) {
  packet_lost_sequence_numbers_ = std::move(nack_list);
}

bool NackPacket::Serialize(ByteWriter* byte_writer) {
  ASSERT(byte_writer);
  std::vector<PackedNack> packed;
  auto it = packet_lost_sequence_numbers_.begin();
  const auto end = packet_lost_sequence_numbers_.end();
  while (it != end) {
    PackedNack item;
    item.first_pid = *it++;
    // Bitmask specifies losses in any of the 16 packets following the pid.
    item.bitmask = 0;
    while (it != end) {
      uint16_t shift = static_cast<uint16_t>(*it - item.first_pid - 1);
      if (shift <= 15) {
        item.bitmask |= (1 << shift);
        ++it;
      } else {
        break;
      }
    }
    packed.push_back(item);
  }
  header_.count_or_format = FeedbackRtpMessageType::kNack;
  header_.length = (kHeaderLength + kCommonFeedbackLength + kNackItemLength * packed.size()) / 4 - 1;
  header_.packet_type = kRtcpTypeRtpfb;
  header_.version = 2;
  header_.padding = 0;

  if (!SerializeCommonHeader(byte_writer))
    return false;
  if (!SerializeCommonFeedback(byte_writer))
    return false;
  for (auto i : packed) {
    byte_writer->WriteUInt16(i.first_pid);
    byte_writer->WriteUInt16(i.bitmask);
  }
  return true;
}

bool NackPacket::Parse(ByteReader* byte_reader) {
  ASSERT(byte_reader);
  if (!ParseCommonHeader(byte_reader))
    return false;
  if (!ParseCommonFeedback(byte_reader))
    return false;
  int payload_len = header_.length * 4;
  size_t nack_items = (payload_len - kCommonFeedbackLength) / kNackItemLength;

  uint16_t pid = 0, blp = 0;
  for (size_t index = 0; index < nack_items; ++index) {
    if (!byte_reader->ReadUInt16(&pid))
      return false;
    if (!byte_reader->ReadUInt16(&blp))
      return false;
    packet_lost_sequence_numbers_.push_back(pid);

    pid = pid + 1;
    for (uint16_t bitmask = blp; bitmask != 0; bitmask >>= 1, ++pid) {
      if (bitmask & 1)
        packet_lost_sequence_numbers_.push_back(pid);
    }
  }

  return true;
}

bool RrtrBlockContext::Parse(ByteReader* byte_reader) {
  uint32_t seconds = 0;
  uint32_t fraction = 0;
  ASSERT(byte_reader);
  if (!byte_reader->ReadUInt32(&seconds))
    return false;
  if (!byte_reader->ReadUInt32(&fraction))
    return false;
  ntp_ = NtpTime(seconds, fraction);
  return true;
}

bool RrtrBlockContext::Serialize(ByteWriter* byte_writer) const {
  ASSERT(byte_writer);
  if (!ntp_)
    return false;
  if (!byte_writer->WriteUInt32(ntp_->Seconds()))
    return false;
  if (!byte_writer->WriteUInt32(ntp_->Fractions()))
    return false;
  return true;
}

uint16_t RrtrBlockContext::SizeIn32bits() const {
  return kBlockLength / 4;
}

bool DlrrBlockContext::Parse(ByteReader* byte_reader, uint16_t block_length) {
  ASSERT(byte_reader);
  if (block_length % 3 != 0) {
    spdlog::warn("Invalid size for dlrr block.");
    return false;
  }
  size_t blocks_count = block_length / 3;
  sub_blocks_.clear();
  for (int i = 0; i < blocks_count; ++i) {
    ReceiveTimeInfo info;
    if (!byte_reader->ReadUInt32(&info.ssrc))
      return false;
    if (!byte_reader->ReadUInt32(&info.last_rr))
      return false;
    if (!byte_reader->ReadUInt32(&info.delay_since_last_rr))
      return false;
    sub_blocks_.push_back(info);
  }
  return true;
}

bool DlrrBlockContext::Serialize(ByteWriter* byte_writer) const {
  ASSERT(byte_writer);
  for (const auto& sub_block : sub_blocks_) {
    if (!byte_writer->WriteUInt32(sub_block.ssrc))
      return false;
    if (!byte_writer->WriteUInt32(sub_block.last_rr))
      return false;
    if (!byte_writer->WriteUInt32(sub_block.delay_since_last_rr))
      return false;
  }
  return true;
}

uint16_t DlrrBlockContext::SizeIn32bits() const {
  return kSubBlockLength * sub_blocks_.size() / 4;
}

bool XrPacket::Parse(ByteReader* byte_reader) {
  ASSERT(byte_reader);
  if (!ParseCommonHeader(byte_reader))
    return false;
  if (!byte_reader->ReadUInt32(&sender_ssrc_))
    return false;
  int payload_len = header_.length * 4;
  payload_len -= 4;// sender ssrc.
  while (payload_len >= kXrBaseLength) {
    uint8_t block_type = 0;
    uint16_t block_length = 0;
    if (!byte_reader->ReadUInt8(&block_type))
      return false;
    if (!byte_reader->Consume(1)) // reserved.
      return false;
    if (!byte_reader->ReadUInt16(&block_length))
      return false;
    switch (block_type) {
      case kBlockTypeRrtr: {
        RrtrBlockContext rrtr;
        if (!rrtr.Parse(byte_reader))
          return false;
        rrtr_block_context_ = rrtr;
        break;
      }
    case kBlockTypeDlrr: {
        DlrrBlockContext dlrr;
        if (!dlrr.Parse(byte_reader, block_length))
          return false;
        dlrr_block_context_ = dlrr;
        break;
      }
    default: {
        spdlog::warn("Unknown blocl type.");
        if (byte_reader->Consume(block_length * 4))
          return false;
      }
    }
    payload_len -= (block_length + kBlockHeaderIn32Bits) * 4;
  }
  return true;
}

bool XrPacket::Serialize(ByteWriter* byte_writer) {
  ASSERT(byte_writer);
  if (rrtr_block_context_)
    header_.length += (rrtr_block_context_->SizeIn32bits() + kBlockHeaderIn32Bits + 1);
  if (dlrr_block_context_)
    header_.length += (dlrr_block_context_->SizeIn32bits() + kBlockHeaderIn32Bits + 1);
  header_.packet_type = kRtcpTypeXr;
  header_.version = 2;
  header_.padding = 0;
  if (!SerializeCommonHeader(byte_writer))
    return false;
  if (!byte_writer->WriteUInt32(sender_ssrc_))
    return false;
  if (rrtr_block_context_) {
    if (!byte_writer->WriteUInt8(kBlockTypeRrtr))
      return false;
    if (!byte_writer->Consume(1))
      return false;
    if (!byte_writer->WriteUInt16(rrtr_block_context_->SizeIn32bits()))
      return false;
    if (!rrtr_block_context_->Serialize(byte_writer))
      return false;
  }
  if (dlrr_block_context_) {
    if (!byte_writer->WriteUInt8(kBlockTypeDlrr))
      return false;
    if (!byte_writer->Consume(1))
      return false;
    if (!byte_writer->WriteUInt16(dlrr_block_context_->SizeIn32bits()))
      return false;
    if (!dlrr_block_context_->Serialize(byte_writer))
      return false;
  }
  return true;
};

void XrPacket::SetRrtr(const RrtrBlockContext& rrtr) {
  rrtr_block_context_.emplace(rrtr);
}

void XrPacket::SetDlrr(const DlrrBlockContext& dlrr) {
  dlrr_block_context_.emplace(dlrr);
}

std::optional<RrtrBlockContext> XrPacket::Rrtr() const {
  return rrtr_block_context_;
}

std::optional<DlrrBlockContext> XrPacket::Dlrr() const {
  return dlrr_block_context_;
}

bool RtcpCompound::Parse(uint8_t* data, int size) {
  ByteReader byte_reader(data, size);

  while (byte_reader.Left() >= 2) {
    RtcpPacket* packet = nullptr;
    RtcpCommonHeader* header = (RtcpCommonHeader*)byte_reader.CurrentData();
    if (header->packet_type == kRtcpTypeRtpfb) {
      if (header->count_or_format == kNack) {
        packet = new NackPacket;
      } 
      else if (header->count_or_format == kTwcc) {
        packet = new TransportFeedback();
      }
      else {
        packet = new RtcpPacket;
      }
    } else if (header->packet_type == kRtcpTypeRr) {
      packet = new ReceiverReportPacket;
    } else if (header->packet_type == kRtcpTypeXr) {
      packet = new XrPacket;
    } else {
      packet = new RtcpPacket;
    }

    if (!packet->Parse(&byte_reader)) {
      spdlog::warn("rtcp packet parse error.");
      return false;
    }
    rtcps_.push_back(packet);
  }

  return true;
}

std::vector<RtcpPacket*> RtcpCompound::GetRtcpPackets() {
  return rtcps_;
}

RtcpCompound::~RtcpCompound() {
  for (auto p : rtcps_) {
    if (p)
      delete p;
  }
}