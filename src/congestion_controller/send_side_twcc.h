#pragma once

#include <cstdint>
#include <cstddef>
#include <vector>
#include <map>
#include <memory>

#include "transport_feedback.h"
#include "sequence_number_util.h"
#include "inter_arrival_delta.h"
#include "trendline_estimator.h"

struct PacketStatus {
  int64_t sent_time_millis{-1};
  int64_t receive_time_millis{-1};
  size_t size{0};
  int64_t transport_wide_sequence_number{-1};

  bool IsReceived() const {
    return IsSent() && receive_time_millis != -1;
  }

  bool IsSent() const {
    return sent_time_millis != -1 && size != 0 && transport_wide_sequence_number != -1;
  }
};

class SendSideTWCC {
 public:
  SendSideTWCC();
  void SendPacket(const PacketStatus& packet);
  void ReceiveTransportFeedback(const TransportFeedback& feedback);
  BandwidthUsage State();
 private:
  static constexpr int64_t kSendTimeWindowMillis = 60000;
  std::map<int64_t, PacketStatus> history_;
  SeqNumUnwrapper<uint16_t> seq_num_unwrapper_;
  std::unique_ptr<InterArrivalDelta> inter_arrival_delta_;
  std::unique_ptr<TrendlineEstimator> trendline_estimator_;
};