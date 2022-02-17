#pragma once

#include <cstddef>
#include <cstdint>
#include <deque>
#include <memory>

#include "rtp_packet.h"

/**
 * @brief This class is used to store packets for
 * retransmission, based on webrtc::RtpPacketHistory.
 * 
 */
class SendPacketRecorder {
 public:
  void SetRtt(int64_t rtt_ms);
  void Record(std::unique_ptr<RtpPacket> packet);
  std::unique_ptr<RtpPacket> Query(uint16_t sequence_number);

 private:
  // Maximum number of packets we ever allow in the queue.
  static constexpr size_t kMaxCapacity = 9600;
  // Don't remove packets within max(1000ms, 3x RTT).
  static constexpr int64_t kMinPacketDurationMs = 1000;
  static constexpr int kMinPacketDurationRtt = 3;
  // Always remove packets after 3x max(1000ms, 3x rtt).
  static constexpr int kPacketCullingDelayFactor = 3;
  class RecordedPacket {
   public:
    RecordedPacket(std::unique_ptr<RtpPacket> packet, int64_t send_time_ms)
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
  RecordedPacket* GetRecordedPacket(uint16_t sequence_number);

  // Queue of Recorded packets, ordered by sequence number, with older packets in
  // the front and new packets being added to the back. Note that there may be
  // wrap-arounds so the back may have a lower sequence number.
  // Packets may also be removed out-of-order, in which case there will be
  // instances of RecordedPacket with `packet_` set to nullptr. The first and last
  // entry in the queue will however always be populated.
  std::deque<RecordedPacket> packet_queue_;
  int64_t rtt_ms_{-1};
};