#include "track_statistics.h"

#include <cmath>

#include "spdlog/spdlog.h"
#include "utils.h"

constexpr int kDefaultMaxReorderingThreshold = 5;  // In sequence numbers.
constexpr int64_t kStatisticsTimeoutMs = 8000;
constexpr int64_t kStatisticsProcessIntervalMs = 1000;

TrackStatistics::TrackStatistics(uint32_t ssrc, uint32_t clock_rate)
    : ssrc_{ssrc},
      clock_rate_{clock_rate},
      max_reordering_threshold_{kDefaultMaxReorderingThreshold} {}

void TrackStatistics::ReceivePacket(std::shared_ptr<RtpPacket> packet) {
  if (ssrc_ != packet->Ssrc()) {
    spdlog::error("Received SSRC different packet. Processed SSRC = {}, Different SSRC = {}", ssrc_, packet->Ssrc());
    return;
  }
  int64_t now_ms = TimeMillis();
  incoming_bitrate_.Update(packet->Size(), now_ms);
  transmitted_packets_++;
  --cumulative_loss_;
  int64_t sequence_number = seq_unwrapper_.UnwrapWithoutUpdate(packet->SequenceNumber());
  if (received_seq_first_ == -1) {
    received_seq_first_ = sequence_number;
    last_report_seq_max_ = sequence_number - 1;
    received_seq_max_ = sequence_number - 1;
  } else if (UpdateOutOfOrder(packet, sequence_number, now_ms)) {
    return;
  }

  // In order packet.
  cumulative_loss_ += sequence_number - received_seq_max_;
  received_seq_max_ = sequence_number;
  seq_unwrapper_.UpdateLast(sequence_number);
  // If new time stamp and more than one in-order packet received, calculate
  // new jitter statistics.
  if (packet->Timestamp() != last_received_timestamp_ && (transmitted_packets_ - retransmited_packets_) > 1) {
    UpdateJitter(packet, now_ms);
  }
  last_received_timestamp_ = packet->Timestamp();
  last_receive_time_ms_ = now_ms;
}

void TrackStatistics::EnableRetransmitDetection(bool enable) {
  enable_retransmit_detection_ = enable;
}

void TrackStatistics::MaybeAppendReportBlockAndReset(std::vector<ReportBlock>& report_blocks) {
  int64_t now_ms = TimeMillis();
  if (now_ms - last_receive_time_ms_ >= kStatisticsTimeoutMs) {
    // Not active.
    return;
  }
  if (received_seq_first_ == -1)
    return;
  report_blocks.emplace_back();
  ReportBlock& stats = report_blocks.back();
  stats.SetMediaSsrc(ssrc_);
  // Calculate fraction lost.
  int64_t exp_since_last = received_seq_max_ - last_report_seq_max_;

  int32_t lost_since_last = cumulative_loss_ - last_report_cumulative_loss_;
  if (exp_since_last > 0 && lost_since_last > 0) {
    // Scale 0 to 255, where 255 is 100% loss.
    stats.SetFractionLost(255 * lost_since_last / exp_since_last);
  }

  int packets_lost = cumulative_loss_ + cumulative_loss_rtcp_offset_;
  if (packets_lost < 0) {
    // Clamp to zero. Work around to accomodate for senders that misbehave with
    // negative cumulative loss.
    packets_lost = 0;
    cumulative_loss_rtcp_offset_ = -cumulative_loss_;
  }
  if (packets_lost > 0x7fffff) {
    packets_lost = 0x7fffff;
  }
  stats.SetCumulativeLost(packets_lost);
  stats.SetExtHighestSeqNum(received_seq_max_);
  // Note: internal jitter value is in Q4 and needs to be scaled by 1/16.
  stats.SetJitter(jitter_q4_ >> 4);

  // Only for report blocks in RTCP SR and RR.
  last_report_cumulative_loss_ = cumulative_loss_;
  last_report_seq_max_ = received_seq_max_;
}

int64_t TrackStatistics::BitrateReceived() const {
  return incoming_bitrate_.Rate(TimeMillis()).value_or(0);
}

bool TrackStatistics::IsRetransmitOfOldPacket(std::shared_ptr<RtpPacket> packet, int64_t now_ms) const {
  uint32_t frequency_khz = clock_rate_ / 1000;
  int64_t time_diff_ms = now_ms - last_receive_time_ms_;

  // Diff in time stamp since last received in order.
  uint32_t timestamp_diff = packet->Timestamp() - last_received_timestamp_;
  uint32_t rtp_time_stamp_diff_ms = timestamp_diff / frequency_khz;

  int64_t max_delay_ms = 0;

  // Jitter standard deviation in samples.
  float jitter_std = std::sqrt(static_cast<float>(jitter_q4_ >> 4));

  // 2 times the standard deviation => 95% confidence.
  // And transform to milliseconds by dividing by the frequency in kHz.
  max_delay_ms = static_cast<int64_t>((2 * jitter_std) / frequency_khz);

  // Min max_delay_ms is 1.
  if (max_delay_ms == 0) {
    max_delay_ms = 1;
  }
  return time_diff_ms > rtp_time_stamp_diff_ms + max_delay_ms;
}

bool TrackStatistics::UpdateOutOfOrder(std::shared_ptr<RtpPacket> packet, int64_t sequence_number, int64_t now_ms) {
  // Check if `packet` is second packet of a stream restart.
  if (received_seq_out_of_order_) {
    // Count the previous packet as a received; it was postponed below.
    --cumulative_loss_;

    uint16_t expected_sequence_number = *received_seq_out_of_order_ + 1;
    received_seq_out_of_order_ = std::nullopt;
    if (packet->SequenceNumber() == expected_sequence_number) {
      // Ignore sequence number gap caused by stream restart for packet loss
      // calculation, by setting received_seq_max_ to the sequence number just
      // before the out-of-order seqno. This gives a net zero change of
      // `cumulative_loss_`, for the two packets interpreted as a stream reset.
      //
      // Fraction loss for the next report may get a bit off, since we don't
      // update last_report_seq_max_ and last_report_cumulative_loss_ in a
      // consistent way.
      last_report_seq_max_ = sequence_number - 2;
      received_seq_max_ = sequence_number - 2;
      return false;
    }
  }

  if (std::abs(sequence_number - received_seq_max_) > max_reordering_threshold_) {
    // Sequence number gap looks too large, wait until next packet to check
    // for a stream restart.
    received_seq_out_of_order_ = packet->SequenceNumber();
    // Postpone counting this as a received packet until we know how to update
    // `received_seq_max_`, otherwise we temporarily decrement
    // `cumulative_loss_`. The
    // ReceiveStatisticsTest.StreamRestartDoesntCountAsLoss test expects
    // `cumulative_loss_` to be unchanged by the reception of the first packet
    // after stream reset.
    ++cumulative_loss_;
    return true;
  }

  if (sequence_number > received_seq_max_)
    return false;
  // Old out of order packet, may be retransmit.
  if (enable_retransmit_detection_ && IsRetransmitOfOldPacket(packet, now_ms))
    retransmited_packets_++;
  return true;
}

void TrackStatistics::UpdateJitter(std::shared_ptr<RtpPacket> packet, int64_t receive_time_ms) {
  int64_t receive_diff_ms = receive_time_ms - last_receive_time_ms_;
  uint32_t receive_diff_rtp = static_cast<uint32_t>((receive_diff_ms * clock_rate_) / 1000);
  int32_t time_diff_samples = receive_diff_rtp - (packet->Timestamp() - last_received_timestamp_);

  time_diff_samples = std::abs(time_diff_samples);

  // lib_jingle sometimes deliver crazy jumps in TS for the same stream.
  // If this happens, don't update jitter value. Use 5 secs video frequency
  // as the threshold.
  if (time_diff_samples < 450000) {
    // Note we calculate in Q4 to avoid using float.
    int32_t jitter_diff_q4 = (time_diff_samples << 4) - jitter_q4_;
    jitter_q4_ += ((jitter_diff_q4 + 8) >> 4);
  }
}