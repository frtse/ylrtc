#pragma once

#include <cstdint>
#include <memory>
#include <optional>

#include "bitrate_estimator.h"
#include "rtcp_packet.h"
#include "rtp_packet.h"
#include "sequence_number_util.h"

class ReceiveStatistician {
 public:
  ReceiveStatistician(uint32_t ssrc, uint32_t clock_rate);
  void ReceivePacket(std::shared_ptr<RtpPacket> packet);
  void EnableRetransmitDetection(bool enable);
  void MaybeAppendReportBlockAndReset(std::vector<ReportBlock>& report_blocks);
  int64_t BitrateReceived() const;

 private:
  bool IsRetransmitOfOldPacket(std::shared_ptr<RtpPacket> packet, int64_t now_ms) const;
  bool UpdateOutOfOrder(std::shared_ptr<RtpPacket> packet, int64_t sequence_number, int64_t now_ms);
  void UpdateJitter(std::shared_ptr<RtpPacket> packet, int64_t receive_time_ms);

  const uint32_t ssrc_;
  const uint32_t clock_rate_;
  BitRateEstimator incoming_bitrate_;
  // In number of packets or sequence numbers.
  int max_reordering_threshold_;
  bool enable_retransmit_detection_{false};

  // Stats on received RTP packets.
  uint32_t jitter_q4_{0};
  // Cumulative loss according to RFC 3550, which may be negative (and often is,
  // if packets are reordered and there are non-RTX retransmissions).
  int32_t cumulative_loss_{0};
  // Offset added to outgoing rtcp reports, to make ensure that the reported
  // cumulative loss is non-negative. Reports with negative values confuse some
  // senders, in particular, our own loss-based bandwidth estimator.
  int32_t cumulative_loss_rtcp_offset_{0};

  int64_t last_receive_time_ms_{0};
  uint32_t last_received_timestamp_{0};
  SeqNumUnwrapper<uint16_t> seq_unwrapper_;
  int64_t received_seq_first_{-1};
  int64_t received_seq_max_{-1};
  // Assume that the other side restarted when there are two sequential packets
  // with large jump from received_seq_max_.
  std::optional<uint16_t> received_seq_out_of_order_;

  // Counter values when we sent the last report.
  int32_t last_report_cumulative_loss_{0};
  int64_t last_report_seq_max_{-1};
  uint32_t transmitted_packets_{0};
  uint32_t retransmited_packets_{0};
};