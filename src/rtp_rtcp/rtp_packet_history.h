#pragma once

#include <cstddef>
#include <cstdint>
#include <deque>
#include <memory>

#include "rtp_packet.h"

class RtpPacketHistory {
 public:
  // Maximum number of packets we ever allow in the history.
  static constexpr size_t kMaxCapacity = 9600;
  // Don't remove packets within max(1000ms, 3x RTT).
  static constexpr int64_t kMinPacketDurationMs = 1000;
  static constexpr int kMinPacketDurationRtt = 3;
  // With kStoreAndCull, always remove packets after 3x max(1000ms, 3x rtt).
  static constexpr int kPacketCullingDelayFactor = 3;

  // Set RTT, used to avoid premature retransmission and to prevent over-writing
  // a packet in the history before we are reasonably sure it has been received.
  void SetRtt(int64_t rtt_ms);
  void PutRtpPacket(std::unique_ptr<RtpPacket> packet);
  // Gets stored RTP packet corresponding to the input |sequence number|.
  // Returns nullptr if packet is not found or was (re)sent too recently.
  std::unique_ptr<RtpPacket> GetPacketAndSetSendTime(uint16_t sequence_number);

 private:
  class StoredPacket {
   public:
    StoredPacket(std::unique_ptr<RtpPacket> packet, int64_t send_time_ms)
        : send_time_ms_(send_time_ms), packet_(std::move(packet)), times_retransmitted_(0) {}

    // The time of last transmission, including retransmissions.
    int64_t send_time_ms_;

    // The actual packet.
    std::unique_ptr<RtpPacket> packet_;

    // Number of times RE-transmitted, ie excluding the first transmission.
    size_t times_retransmitted_;
  };
  void CullOldPackets(int64_t now_ms);
  std::unique_ptr<RtpPacket> RemovePacket(int packet_index);
  int GetPacketIndex(uint16_t sequence_number) const;
  StoredPacket* GetStoredPacket(uint16_t sequence_number);
  bool VerifyRtt(const StoredPacket& packet, int64_t now_ms) const;

  // Queue of stored packets, ordered by sequence number, with older packets in
  // the front and new packets being added to the back. Note that there may be
  // wrap-arounds so the back may have a lower sequence number.
  // Packets may also be removed out-of-order, in which case there will be
  // instances of StoredPacket with `packet_` set to nullptr. The first and last
  // entry in the queue will however always be populated.
  std::deque<StoredPacket> packet_history_;
  int64_t rtt_ms_{-1};
};