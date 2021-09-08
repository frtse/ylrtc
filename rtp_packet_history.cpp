#include "rtp_packet_history.h"

#include <limits>

#include "sequence_number_util.h"
#include "spdlog/spdlog.h"
#include "utils.h"

void RtpPacketHistory::SetRtt(int64_t rtt_ms) {
  rtt_ms_ = rtt_ms;
  CullOldPackets(TimeMillis());
}

void RtpPacketHistory::PutRtpPacket(std::shared_ptr<RtpPacket> packet) {
  int64_t now_ms = TimeMillis();
  CullOldPackets(now_ms);
  // Store packet.
  const uint16_t rtp_seq_no = packet->SequenceNumber();
  int packet_index = GetPacketIndex(rtp_seq_no);
  if (packet_index >= 0 && static_cast<size_t>(packet_index) < packet_history_.size() && packet_history_[packet_index].packet_ != nullptr) {
    spdlog::warn("Duplicate packet inserted: {}.", rtp_seq_no);
    // Remove previous packet to avoid inconsistent state.
    RemovePacket(packet_index);
    packet_index = GetPacketIndex(rtp_seq_no);
  }

  // Packet to be inserted ahead of first packet, expand front.
  for (; packet_index < 0; ++packet_index) {
    packet_history_.emplace_front(nullptr, 0, 0);
  }
  // Packet to be inserted behind last packet, expand back.
  while (static_cast<int>(packet_history_.size()) <= packet_index) {
    packet_history_.emplace_back(nullptr, 0, 0);
  }

  packet_history_[packet_index] = StoredPacket(packet, now_ms, packets_inserted_++);
}

int RtpPacketHistory::GetPacketIndex(uint16_t sequence_number) const {
  if (packet_history_.empty()) {
    return 0;
  }

  uint16_t first_seq = packet_history_.front().packet_->SequenceNumber();
  if (first_seq == sequence_number) {
    return 0;
  }

  int packet_index = sequence_number - first_seq;
  constexpr int kSeqNumSpan = std::numeric_limits<uint16_t>::max() + 1;

  if (AheadOf(sequence_number, first_seq)) {
    if (sequence_number < first_seq) {
      // Forward wrap.
      packet_index += kSeqNumSpan;
    }
  } else if (sequence_number > first_seq) {
    // Backwards wrap.
    packet_index -= kSeqNumSpan;
  }

  return packet_index;
}

void RtpPacketHistory::CullOldPackets(int64_t now_ms) {
  int64_t packet_duration_ms = std::max(kMinPacketDurationRtt * rtt_ms_, kMinPacketDurationMs);
  while (!packet_history_.empty()) {
    if (packet_history_.size() >= kMaxCapacity) {
      // We have reached the absolute max capacity, remove one packet
      // unconditionally.
      RemovePacket(0);
      continue;
    }

    const StoredPacket& stored_packet = packet_history_.front();
    if (stored_packet.send_time_ms_ + packet_duration_ms > now_ms) {
      // Don't cull packets too early to avoid failed retransmission requests.
      return;
    }

    if (packet_history_.size() >= kMaxCapacity || stored_packet.send_time_ms_ + (packet_duration_ms * kPacketCullingDelayFactor) <= now_ms) {
      // Too many packets in history, or this packet has timed out. Remove it
      // and continue.
      RemovePacket(0);
    } else {
      // No more packets can be removed right now.
      return;
    }
  }
}

std::shared_ptr<RtpPacket> RtpPacketHistory::RemovePacket(int packet_index) {
  // Move the packet out from the StoredPacket container.
  std::shared_ptr<RtpPacket> rtp_packet = packet_history_[packet_index].packet_;
  packet_history_[packet_index].packet_ = nullptr;

  if (packet_index == 0) {
    while (!packet_history_.empty() && packet_history_.front().packet_ == nullptr) {
      packet_history_.pop_front();
    }
  }

  return rtp_packet;
}

std::shared_ptr<RtpPacket> RtpPacketHistory::GetPacketAndSetSendTime(uint16_t sequence_number) {
  StoredPacket* packet = GetStoredPacket(sequence_number);
  if (packet == nullptr) {
    return nullptr;
  }

  int64_t now_ms = TimeMillis();
  if (!VerifyRtt(*packet, now_ms)) {
    return nullptr;
  }

  if (packet->send_time_ms_) {
    packet->times_retransmitted_++;
  }

  // Update send-time and mark as no long in pacer queue.
  packet->send_time_ms_ = now_ms;

  // Return packet since it may need to be retransmitted.
  return packet->packet_;
}

RtpPacketHistory::StoredPacket* RtpPacketHistory::GetStoredPacket(uint16_t sequence_number) {
  int index = GetPacketIndex(sequence_number);
  if (index < 0 || static_cast<size_t>(index) >= packet_history_.size() || packet_history_[index].packet_ == nullptr) {
    return nullptr;
  }
  return &packet_history_[index];
}

bool RtpPacketHistory::VerifyRtt(const RtpPacketHistory::StoredPacket& packet, int64_t now_ms) const {
  if (packet.send_time_ms_) {
    // Send-time already set, this check must be for a retransmission.
    if (packet.times_retransmitted_ > 0 && now_ms < packet.send_time_ms_ + rtt_ms_) {
      // This packet has already been retransmitted once, and the time since
      // that even is lower than on RTT. Ignore request as this packet is
      // likely already in the network pipe.
      return false;
    }
  }

  return true;
}
