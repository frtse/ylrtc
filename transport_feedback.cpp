
#include "transport_feedback.h"

#include <algorithm>
#include <cstdint>
#include <utility>

#include "sequence_number_util.h"
#include "spdlog/spdlog.h"
#include "utils.h"

namespace {
// Header size:
// * 4 bytes Common RTCP Packet Header
// * 8 bytes Common Packet Format for RTCP Feedback Messages
// * 8 bytes FeedbackPacket header
constexpr size_t kTransportFeedbackHeaderSizeBytes = 4 + 8 + 8;
constexpr size_t kChunkSizeBytes = 2;
// TODO(sprang): Add support for dynamic max size for easier fragmentation,
// eg. set it to what's left in the buffer or IP_PACKET_SIZE.
// Size constraint imposed by RTCP common header: 16bit size field interpreted
// as number of four byte words minus the first header word.
constexpr size_t kMaxSizeBytes = (1 << 16) * 4;
// Payload size:
// * 8 bytes Common Packet Format for RTCP Feedback Messages
// * 8 bytes FeedbackPacket header.
// * 2 bytes for one chunk.
constexpr size_t kMinPayloadSizeBytes = 8 + 8 + 2;
constexpr int kBaseScaleFactor = TransportFeedback::kDeltaScaleFactor * (1 << 8);
constexpr int64_t kTimeWrapPeriodUs = (1ll << 24) * kBaseScaleFactor;

//    Message format
//
//     0                   1                   2                   3
//     0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//    |V=2|P|  FMT=15 |    PT=205     |           length              |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  0 |                     SSRC of packet sender                     |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  4 |                      SSRC of media source                     |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  8 |      base sequence number     |      packet status count      |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 12 |                 reference time                | fb pkt. count |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// 16 |          packet chunk         |         packet chunk          |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//    .                                                               .
//    .                                                               .
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//    |         packet chunk          |  recv delta   |  recv delta   |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//    .                                                               .
//    .                                                               .
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//    |           recv delta          |  recv delta   | zero padding  |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
}  // namespace
constexpr uint8_t TransportFeedback::kFeedbackMessageType;
constexpr size_t TransportFeedback::kMaxReportedPackets;

constexpr size_t TransportFeedback::LastChunk::kMaxRunLengthCapacity;
constexpr size_t TransportFeedback::LastChunk::kMaxOneBitCapacity;
constexpr size_t TransportFeedback::LastChunk::kMaxTwoBitCapacity;
constexpr size_t TransportFeedback::LastChunk::kMaxVectorCapacity;

TransportFeedback::LastChunk::LastChunk() {
  Clear();
}

bool TransportFeedback::LastChunk::Empty() const {
  return size_ == 0;
}

void TransportFeedback::LastChunk::Clear() {
  size_ = 0;
  all_same_ = true;
  has_large_delta_ = false;
}

bool TransportFeedback::LastChunk::CanAdd(DeltaSize delta_size) const {
  DCHECK(delta_size <= 2);
  if (size_ < kMaxTwoBitCapacity)
    return true;
  if (size_ < kMaxOneBitCapacity && !has_large_delta_ && delta_size != kLarge)
    return true;
  if (size_ < kMaxRunLengthCapacity && all_same_ && delta_sizes_[0] == delta_size)
    return true;
  return false;
}

void TransportFeedback::LastChunk::Add(DeltaSize delta_size) {
  DCHECK(CanAdd(delta_size));
  if (size_ < kMaxVectorCapacity)
    delta_sizes_[size_] = delta_size;
  size_++;
  all_same_ = all_same_ && delta_size == delta_sizes_[0];
  has_large_delta_ = has_large_delta_ || delta_size == kLarge;
}

uint16_t TransportFeedback::LastChunk::Emit() {
  DCHECK(!CanAdd(0) || !CanAdd(1) || !CanAdd(2));
  if (all_same_) {
    uint16_t chunk = EncodeRunLength();
    Clear();
    return chunk;
  }
  if (size_ == kMaxOneBitCapacity) {
    uint16_t chunk = EncodeOneBit();
    Clear();
    return chunk;
  }
  DCHECK(size_ >= kMaxTwoBitCapacity);
  uint16_t chunk = EncodeTwoBit(kMaxTwoBitCapacity);
  // Remove `kMaxTwoBitCapacity` encoded delta sizes:
  // Shift remaining delta sizes and recalculate all_same_ && has_large_delta_.
  size_ -= kMaxTwoBitCapacity;
  all_same_ = true;
  has_large_delta_ = false;
  for (size_t i = 0; i < size_; ++i) {
    DeltaSize delta_size = delta_sizes_[kMaxTwoBitCapacity + i];
    delta_sizes_[i] = delta_size;
    all_same_ = all_same_ && delta_size == delta_sizes_[0];
    has_large_delta_ = has_large_delta_ || delta_size == kLarge;
  }

  return chunk;
}

uint16_t TransportFeedback::LastChunk::EncodeLast() const {
  DCHECK(size_ > 0);
  if (all_same_)
    return EncodeRunLength();
  if (size_ <= kMaxTwoBitCapacity)
    return EncodeTwoBit(size_);
  return EncodeOneBit();
}

// Appends content of the Lastchunk to `deltas`.
void TransportFeedback::LastChunk::AppendTo(std::vector<DeltaSize>* deltas) const {
  if (all_same_) {
    deltas->insert(deltas->end(), size_, delta_sizes_[0]);
  } else {
    deltas->insert(deltas->end(), delta_sizes_, delta_sizes_ + size_);
  }
}

void TransportFeedback::LastChunk::Decode(uint16_t chunk, size_t max_size) {
  if ((chunk & 0x8000) == 0) {
    DecodeRunLength(chunk, max_size);
  } else if ((chunk & 0x4000) == 0) {
    DecodeOneBit(chunk, max_size);
  } else {
    DecodeTwoBit(chunk, max_size);
  }
}

//  One Bit Status Vector Chunk
//
//  0                   1
//  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  |T|S|       symbol list         |
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//
//  T = 1
//  S = 0
//  Symbol list = 14 entries where 0 = not received, 1 = received 1-byte delta.
uint16_t TransportFeedback::LastChunk::EncodeOneBit() const {
  DCHECK(!has_large_delta_);
  DCHECK(size_ <= kMaxOneBitCapacity);
  uint16_t chunk = 0x8000;
  for (size_t i = 0; i < size_; ++i)
    chunk |= delta_sizes_[i] << (kMaxOneBitCapacity - 1 - i);
  return chunk;
}

void TransportFeedback::LastChunk::DecodeOneBit(uint16_t chunk, size_t max_size) {
  DCHECK((chunk & 0xc000) == 0x8000);
  size_ = std::min(kMaxOneBitCapacity, max_size);
  has_large_delta_ = false;
  all_same_ = false;
  for (size_t i = 0; i < size_; ++i)
    delta_sizes_[i] = (chunk >> (kMaxOneBitCapacity - 1 - i)) & 0x01;
}

//  Two Bit Status Vector Chunk
//
//  0                   1
//  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  |T|S|       symbol list         |
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//
//  T = 1
//  S = 1
//  symbol list = 7 entries of two bits each.
uint16_t TransportFeedback::LastChunk::EncodeTwoBit(size_t size) const {
  DCHECK(size <= size_);
  uint16_t chunk = 0xc000;
  for (size_t i = 0; i < size; ++i)
    chunk |= delta_sizes_[i] << 2 * (kMaxTwoBitCapacity - 1 - i);
  return chunk;
}

void TransportFeedback::LastChunk::DecodeTwoBit(uint16_t chunk, size_t max_size) {
  DCHECK((chunk & 0xc000) == 0xc000);
  size_ = std::min(kMaxTwoBitCapacity, max_size);
  has_large_delta_ = true;
  all_same_ = false;
  for (size_t i = 0; i < size_; ++i)
    delta_sizes_[i] = (chunk >> 2 * (kMaxTwoBitCapacity - 1 - i)) & 0x03;
}

//  Run Length Status Vector Chunk
//
//  0                   1
//  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//  |T| S |       Run Length        |
//  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//
//  T = 0
//  S = symbol
//  Run Length = Unsigned integer denoting the run length of the symbol
uint16_t TransportFeedback::LastChunk::EncodeRunLength() const {
  DCHECK(all_same_);
  DCHECK(size_ <= kMaxRunLengthCapacity);
  return (delta_sizes_[0] << 13) | static_cast<uint16_t>(size_);
}

void TransportFeedback::LastChunk::DecodeRunLength(uint16_t chunk, size_t max_count) {
  DCHECK((chunk & 0x8000) == 0);
  size_ = std::min<size_t>(chunk & 0x1fff, max_count);
  DeltaSize delta_size = (chunk >> 13) & 0x03;
  has_large_delta_ = delta_size >= kLarge;
  all_same_ = true;
  // To make it consistent with Add function, populate delta_sizes_ beyond 1st.
  for (size_t i = 0; i < std::min<size_t>(size_, kMaxVectorCapacity); ++i)
    delta_sizes_[i] = delta_size;
}

TransportFeedback::TransportFeedback() : TransportFeedback(/*include_timestamps=*/true, /*include_lost=*/true) {}

TransportFeedback::TransportFeedback(bool include_timestamps, bool include_lost)
    : include_lost_(include_lost),
      base_seq_no_(0),
      num_seq_no_(0),
      base_time_ticks_(0),
      feedback_seq_(0),
      include_timestamps_(include_timestamps),
      last_timestamp_us_(0),
      size_bytes_(kTransportFeedbackHeaderSizeBytes) {}

TransportFeedback::TransportFeedback(const TransportFeedback&) = default;

TransportFeedback::TransportFeedback(TransportFeedback&& other)
    : include_lost_(other.include_lost_),
      base_seq_no_(other.base_seq_no_),
      num_seq_no_(other.num_seq_no_),
      base_time_ticks_(other.base_time_ticks_),
      feedback_seq_(other.feedback_seq_),
      include_timestamps_(other.include_timestamps_),
      last_timestamp_us_(other.last_timestamp_us_),
      received_packets_(std::move(other.received_packets_)),
      all_packets_(std::move(other.all_packets_)),
      encoded_chunks_(std::move(other.encoded_chunks_)),
      last_chunk_(other.last_chunk_),
      size_bytes_(other.size_bytes_) {
  other.Clear();
}

TransportFeedback::~TransportFeedback() {}

void TransportFeedback::SetBase(uint16_t base_sequence, int64_t ref_timestamp_us) {
  DCHECK(num_seq_no_ == 0);
  DCHECK(ref_timestamp_us >= 0);
  base_seq_no_ = base_sequence;
  base_time_ticks_ = (ref_timestamp_us % kTimeWrapPeriodUs) / kBaseScaleFactor;
  last_timestamp_us_ = GetBaseTimeUs();
}

void TransportFeedback::SetFeedbackSequenceNumber(uint8_t feedback_sequence) {
  feedback_seq_ = feedback_sequence;
}

bool TransportFeedback::AddReceivedPacket(uint16_t sequence_number, int64_t timestamp_us) {
  // Set delta to zero if timestamps are not included, this will simplify the
  // encoding process.
  int16_t delta = 0;
  if (include_timestamps_) {
    // Convert to ticks and round.
    int64_t delta_full = (timestamp_us - last_timestamp_us_) % kTimeWrapPeriodUs;
    if (delta_full > kTimeWrapPeriodUs / 2)
      delta_full -= kTimeWrapPeriodUs;
    delta_full += delta_full < 0 ? -(kDeltaScaleFactor / 2) : kDeltaScaleFactor / 2;
    delta_full /= kDeltaScaleFactor;

    delta = static_cast<int16_t>(delta_full);
    // If larger than 16bit signed, we can't represent it - need new fb packet.
    if (delta != delta_full) {
      spdlog::warn("Delta value too large ( >= 2^16 ticks )");
      return false;
    }
  }

  uint16_t next_seq_no = base_seq_no_ + num_seq_no_;
  if (sequence_number != next_seq_no) {
    uint16_t last_seq_no = next_seq_no - 1;
    if (!SeqNumGT(sequence_number, last_seq_no))
      return false;
    for (; next_seq_no != sequence_number; ++next_seq_no) {
      if (!AddDeltaSize(0))
        return false;
      if (include_lost_)
        all_packets_.emplace_back(next_seq_no);
    }
  }

  DeltaSize delta_size = (delta >= 0 && delta <= 0xff) ? 1 : 2;
  if (!AddDeltaSize(delta_size))
    return false;

  received_packets_.emplace_back(sequence_number, delta);
  if (include_lost_)
    all_packets_.emplace_back(sequence_number, delta);
  last_timestamp_us_ += delta * kDeltaScaleFactor;
  if (include_timestamps_) {
    size_bytes_ += delta_size;
  }
  return true;
}

const std::vector<TransportFeedback::ReceivedPacket>& TransportFeedback::GetReceivedPackets() const {
  return received_packets_;
}

const std::vector<TransportFeedback::ReceivedPacket>& TransportFeedback::GetAllPackets() const {
  DCHECK(include_lost_);
  return all_packets_;
}

uint16_t TransportFeedback::GetBaseSequence() const {
  return base_seq_no_;
}

int64_t TransportFeedback::GetBaseTimeUs() const {
  return static_cast<int64_t>(base_time_ticks_) * kBaseScaleFactor;
}

int64_t TransportFeedback::GetBaseDeltaUs(int64_t prev_timestamp_us) const {
  int64_t delta = GetBaseTimeUs() - prev_timestamp_us;

  // Detect and compensate for wrap-arounds in base time.
  if (std::abs(delta - kTimeWrapPeriodUs) < std::abs(delta)) {
    delta -= kTimeWrapPeriodUs;  // Wrap backwards.
  } else if (std::abs(delta + kTimeWrapPeriodUs) < std::abs(delta)) {
    delta += kTimeWrapPeriodUs;  // Wrap forwards.
  }
  return delta;
}

bool TransportFeedback::IsConsistent() const {
  size_t packet_size = kTransportFeedbackHeaderSizeBytes;
  std::vector<DeltaSize> delta_sizes;
  LastChunk chunk_decoder;
  for (uint16_t chunk : encoded_chunks_) {
    chunk_decoder.Decode(chunk, kMaxReportedPackets);
    chunk_decoder.AppendTo(&delta_sizes);
    packet_size += kChunkSizeBytes;
  }
  if (!last_chunk_.Empty()) {
    last_chunk_.AppendTo(&delta_sizes);
    packet_size += kChunkSizeBytes;
  }
  if (num_seq_no_ != delta_sizes.size()) {
    spdlog::error("{} packets encoded. Expected {}.", delta_sizes.size(), num_seq_no_);
    return false;
  }
  int64_t timestamp_us = base_time_ticks_ * kBaseScaleFactor;
  auto packet_it = received_packets_.begin();
  uint16_t seq_no = base_seq_no_;
  for (DeltaSize delta_size : delta_sizes) {
    if (delta_size > 0) {
      if (packet_it == received_packets_.end()) {
        spdlog::error("Failed to find delta for seq_no {}", seq_no);
        return false;
      }
      if (packet_it->sequence_number() != seq_no) {
        spdlog::error("Expected to find delta for seq_no {}. Next delta is for {}.", seq_no, packet_it->sequence_number());
        return false;
      }
      if (delta_size == 1 && (packet_it->delta_ticks() < 0 || packet_it->delta_ticks() > 0xff)) {
        spdlog::error("Delta {} for seq_no {} doesn't fit into one byte.", packet_it->delta_ticks(), seq_no);
        return false;
      }
      timestamp_us += packet_it->delta_us();
      ++packet_it;
    }
    if (include_timestamps_) {
      packet_size += delta_size;
    }
    ++seq_no;
  }
  if (packet_it != received_packets_.end()) {
    spdlog::error("Unencoded delta for seq_no {}", packet_it->sequence_number());
    return false;
  }
  if (timestamp_us != last_timestamp_us_) {
    spdlog::error("Last timestamp mismatch. Calculated: {}. Saved: {}", timestamp_us, last_timestamp_us_);
    return false;
  }
  if (size_bytes_ != packet_size) {
    spdlog::error("Rtcp packet size mismatch. Calculated: {}. Saved: {}", packet_size, size_bytes_);
    return false;
  }
  return true;
}

void TransportFeedback::Clear() {
  num_seq_no_ = 0;
  last_timestamp_us_ = GetBaseTimeUs();
  received_packets_.clear();
  all_packets_.clear();
  encoded_chunks_.clear();
  last_chunk_.Clear();
  size_bytes_ = kTransportFeedbackHeaderSizeBytes;
}

bool TransportFeedback::AddDeltaSize(DeltaSize delta_size) {
  if (num_seq_no_ == kMaxReportedPackets)
    return false;
  size_t add_chunk_size = last_chunk_.Empty() ? kChunkSizeBytes : 0;
  if (size_bytes_ + delta_size + add_chunk_size > kMaxSizeBytes)
    return false;

  if (last_chunk_.CanAdd(delta_size)) {
    size_bytes_ += add_chunk_size;
    last_chunk_.Add(delta_size);
    ++num_seq_no_;
    return true;
  }
  if (size_bytes_ + delta_size + kChunkSizeBytes > kMaxSizeBytes)
    return false;

  encoded_chunks_.push_back(last_chunk_.Emit());
  size_bytes_ += kChunkSizeBytes;
  last_chunk_.Add(delta_size);
  ++num_seq_no_;
  return true;
}

bool TransportFeedback::Parse(ByteReader* byte_reader) {
  if (!ParseCommonHeader(byte_reader))
    return false;
  if (header_.packet_type != kRtcpTypeRtpfb || header_.count_or_format != kTwcc)
    return false;
  if (!ParseCommonFeedback(byte_reader))
    return false;
  int payload_len = header_.length * 4;
  uint8_t* payload = (uint8_t*)byte_reader->CurrentData() - kCommonFeedbackLength;
  base_seq_no_ = LoadUInt16BE(&payload[8]);
  uint16_t status_count = LoadUInt16BE(&payload[10]);
  base_time_ticks_ = LoadUInt24BE(&payload[12]);
  feedback_seq_ = payload[15];
  Clear();
  size_t index = 16;
  const size_t end_index = payload_len;

  if (status_count == 0) {
    spdlog::warn("Empty feedback messages not allowed.");
    return false;
  }

  std::vector<uint8_t> delta_sizes;
  delta_sizes.reserve(status_count);
  while (delta_sizes.size() < status_count) {
    if (index + kChunkSizeBytes > end_index) {
      spdlog::warn("Buffer overflow while parsing packet.");
      Clear();
      return false;
    }

    uint16_t chunk = LoadUInt16BE(&payload[index]);
    index += kChunkSizeBytes;
    encoded_chunks_.push_back(chunk);
    last_chunk_.Decode(chunk, status_count - delta_sizes.size());
    last_chunk_.AppendTo(&delta_sizes);
  }
  // Last chunk is stored in the `last_chunk_`.
  encoded_chunks_.pop_back();
  DCHECK(delta_sizes.size() == status_count);
  num_seq_no_ = status_count;

  uint16_t seq_no = base_seq_no_;
  size_t recv_delta_size = 0;
  for (size_t delta_size : delta_sizes) {
    recv_delta_size += delta_size;
  }

  // Determine if timestamps, that is, recv_delta are included in the packet.
  if (end_index >= index + recv_delta_size) {
    for (size_t delta_size : delta_sizes) {
      if (index + delta_size > end_index) {
        spdlog::warn("Buffer overflow while parsing packet.");
        Clear();
        return false;
      }
      switch (delta_size) {
        case 0:
          if (include_lost_)
            all_packets_.emplace_back(seq_no);
          break;
        case 1: {
          int16_t delta = payload[index];
          received_packets_.emplace_back(seq_no, delta);
          if (include_lost_)
            all_packets_.emplace_back(seq_no, delta);
          last_timestamp_us_ += delta * kDeltaScaleFactor;
          index += delta_size;
          break;
        }
        case 2: {
          int16_t delta = LoadUInt16BE(&payload[index]);
          received_packets_.emplace_back(seq_no, delta);
          if (include_lost_)
            all_packets_.emplace_back(seq_no, delta);
          last_timestamp_us_ += delta * kDeltaScaleFactor;
          index += delta_size;
          break;
        }
        case 3:
          Clear();
          spdlog::warn("Invalid delta_size for seq_no {}", seq_no);

          return false;
        default:
          DCHECK(false);
          break;
      }
      ++seq_no;
    }
  } else {
    // The packet does not contain receive deltas.
    include_timestamps_ = false;
    for (size_t delta_size : delta_sizes) {
      // Use delta sizes to detect if packet was received.
      if (delta_size > 0) {
        received_packets_.emplace_back(seq_no, 0);
      }
      if (include_lost_) {
        if (delta_size > 0) {
          all_packets_.emplace_back(seq_no, 0);
        } else {
          all_packets_.emplace_back(seq_no);
        }
      }
      ++seq_no;
    }
  }
  size_bytes_ = RtcpPacket::kHeaderLength + index;
  DCHECK(index <= end_index);
  byte_reader->Consume(end_index - kCommonFeedbackLength);
  return true;
}

bool TransportFeedback::Serialize(ByteWriter* byte_writer) {
  size_t length = (size_bytes_ + 3) & (~static_cast<size_t>(3));
  const size_t padding_length = length - size_bytes_;
  bool has_padding = padding_length > 0;
  header_.count_or_format = FeedbackRtpMessageType::kTwcc;
  header_.length = (length - kHeaderLength) / 4;
  header_.packet_type = kRtcpTypeRtpfb;
  header_.version = 2;
  header_.padding = has_padding ? 1 : 0;

  if (!SerializeCommonHeader(byte_writer))
    return false;
  if (!SerializeCommonFeedback(byte_writer))
    return false;
  if (!byte_writer->WriteUInt16(base_seq_no_))
    return false;
  if (!byte_writer->WriteUInt16(num_seq_no_))
    return false;
  if (!byte_writer->WriteUInt24(base_time_ticks_))
    return false;
  if (!byte_writer->WriteUInt8(feedback_seq_))
    return false;

  for (uint16_t chunk : encoded_chunks_) {
    if (!byte_writer->WriteUInt16(chunk))
      return false;
  }
  if (!last_chunk_.Empty()) {
    uint16_t chunk = last_chunk_.EncodeLast();
    if (!byte_writer->WriteUInt16(chunk))
      return false;
  }

  if (include_timestamps_) {
    for (const auto& received_packet : received_packets_) {
      int16_t delta = received_packet.delta_ticks();
      if (delta >= 0 && delta <= 0xFF) {
        if (!byte_writer->WriteUInt8(delta))
          return false;
      } else {
        if (!byte_writer->WriteUInt16(delta))
          return false;
      }
    }
  }

  if (padding_length > 0) {
    for (size_t i = 0; i < padding_length - 1; ++i) {
      if (!byte_writer->WriteUInt8(0))
        return false;
    }
    if (!byte_writer->WriteUInt8(padding_length))
      return false;
  }
  return true;
}

size_t TransportFeedback::Size() const {
  return (size_bytes_ + 3) & (~static_cast<size_t>(3));
}
