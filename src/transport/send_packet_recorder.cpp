#include "send_packet_recorder.h"

#include <limits>

#include "sequence_number_util.h"
#include "spdlog/spdlog.h"
#include "utils.h"

void SendPacketRecorder::SetRtt(int64_t rtt_ms) {
  rtt_ms_ = rtt_ms;
  CullOldPackets(TimeMillis());
}

void SendPacketRecorder::Record(std::unique_ptr<RtpPacket> packet) {
  int64_t now_ms = TimeMillis();
  CullOldPackets(now_ms);
  // Store packet.
  const uint16_t rtp_seq_no = packet->SequenceNumber();
  int packet_index = GetPacketIndex(rtp_seq_no);
  if (packet_index >= 0 && static_cast<size_t>(packet_index) < packet_queue_.size() && packet_queue_[packet_index].packet_ != nullptr) {
    spdlog::warn("Duplicate packet inserted: {}.", rtp_seq_no);
    // Remove previous packet to avoid inconsistent state.
    RemovePacket(packet_index);
    packet_index = GetPacketIndex(rtp_seq_no);
  }

  // Packet to be inserted ahead of first packet, expand front.
  for (; packet_index < 0; ++packet_index) {
    packet_queue_.emplace_front(nullptr, 0);
  }
  // Packet to be inserted behind last packet, expand back.
  while (static_cast<int>(packet_queue_.size()) <= packet_index) {
    packet_queue_.emplace_back(nullptr, 0);
  }

  packet_queue_[packet_index] = RecordedPacket(std::move(packet), now_ms);
}

int SendPacketRecorder::GetPacketIndex(uint16_t sequence_number) const {
  if (packet_queue_.empty())
    return 0;
  constexpr int kSeqNumSpan = std::numeric_limits<uint16_t>::max() + 1;
  uint16_t first_seq = packet_queue_.front().packet_->SequenceNumber();
  int packet_index = sequence_number - first_seq;
  if (packet_index != 0) {
    if (SeqNumGT(sequence_number, first_seq)) {
      if (sequence_number < first_seq) {
        // Forward wrap.
        packet_index += kSeqNumSpan;
      }
    } else if (sequence_number > first_seq) {
      // Backwards wrap.
      packet_index -= kSeqNumSpan;
    }
  }

  return packet_index;
}

void SendPacketRecorder::CullOldPackets(int64_t now_ms) {
  int64_t packet_duration_ms = std::max(kMinPacketDurationRtt * rtt_ms_, kMinPacketDurationMs);
  while (!packet_queue_.empty()) {
    if (packet_queue_.size() >= kMaxCapacity) {
      RemovePacket(0);
      continue;
    }

    const RecordedPacket& stored_packet = packet_queue_.front();
    if (stored_packet.send_time_ms_ + packet_duration_ms > now_ms)
      return;

    if (stored_packet.send_time_ms_ + (packet_duration_ms * kPacketCullingDelayFactor) <= now_ms) {
      // Too many packets in history, or this packet has timed out. Remove it
      // and continue.
      RemovePacket(0);
    } else {
      // No more packets can be removed right now.
      return;
    }
  }
}

std::unique_ptr<RtpPacket> SendPacketRecorder::RemovePacket(int packet_index) {
  // Move the packet out from the RecordedPacket container.
  std::unique_ptr<RtpPacket> rtp_packet = std::move(packet_queue_[packet_index].packet_);
  packet_queue_[packet_index].packet_ = nullptr;

  if (packet_index == 0) {
    while (!packet_queue_.empty() && packet_queue_.front().packet_ == nullptr) {
      packet_queue_.pop_front();
    }
  }

  return rtp_packet;
}

std::unique_ptr<RtpPacket> SendPacketRecorder::Query(uint16_t sequence_number) {
  RecordedPacket* packet = GetRecordedPacket(sequence_number);
  if (!packet)
    return nullptr;

  int64_t now_ms = TimeMillis();
  // Check whether it is a packet being retransmitted.
  if (packet->send_time_ms_ && packet->times_retransmitted_ > 0 && now_ms < packet->send_time_ms_ + rtt_ms_)
    return nullptr;
  // Update the number of retransmissions of retransmitted packets.
  if (packet->send_time_ms_)
    packet->times_retransmitted_++;
  // update send time.
  packet->send_time_ms_ = now_ms;
  return std::make_unique<RtpPacket>(*packet->packet_);
}

SendPacketRecorder::RecordedPacket* SendPacketRecorder::GetRecordedPacket(uint16_t sequence_number) {
  int index = GetPacketIndex(sequence_number);
  if (index < 0 || static_cast<size_t>(index) >= packet_queue_.size() || packet_queue_[index].packet_ == nullptr) {
    return nullptr;
  }
  return &packet_queue_[index];
}