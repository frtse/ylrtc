#include "receive_side_twcc.h"

#include <algorithm>
#include <limits>
#include <memory>
#include <utility>

#include "spdlog/spdlog.h"
#include "utils.h"

// The maximum allowed value for a timestamp in milliseconds. This is lower
// than the numerical limit since we often convert to microseconds.
static constexpr int64_t kMaxTimeMs = std::numeric_limits<int64_t>::max() / 1000;

ReceiveSideTWCC::ReceiveSideTWCC(boost::asio::io_context& io_context, std::weak_ptr<Observer> observer)
    : observer_(observer),
      last_process_time_millis_(-1),
      media_ssrc_(0),
      feedback_packet_count_(0),
      io_context_{io_context} {
}

void ReceiveSideTWCC::Init() {
  timer_.reset(new Timer(io_context_, shared_from_this()));
  timer_->AsyncWait(TimeUntilNextProcess());
}

void ReceiveSideTWCC::Deinit() {
  timer_->Stop();
}

void ReceiveSideTWCC::IncomingPacket(int64_t arrival_time_ms, uint32_t ssrc, uint16_t transport_sequence_number) {
  if (arrival_time_ms < 0 || arrival_time_ms > kMaxTimeMs) {
    spdlog::warn("Arrival time out of bounds: {}", arrival_time_ms);
    return;
  }
  media_ssrc_ = ssrc;
  int64_t seq = 0;

  seq = unwrapper_.Unwrap(transport_sequence_number);

  MaybeCullOldPackets(seq, arrival_time_ms);

  if (!periodic_window_start_seq_ || seq < *periodic_window_start_seq_) {
    periodic_window_start_seq_ = seq;
  }

  // We are only interested in the first time a packet is received.
  if (packet_arrival_times_.has_received(seq)) {
    return;
  }

  packet_arrival_times_.AddPacket(seq, arrival_time_ms);

  // Limit the range of sequence numbers to send feedback for.
  if (!periodic_window_start_seq_.has_value() || periodic_window_start_seq_.value() < packet_arrival_times_.begin_sequence_number()) {
    periodic_window_start_seq_ = packet_arrival_times_.begin_sequence_number();
  }
}

int64_t ReceiveSideTWCC::TimeUntilNextProcess() {
  if (last_process_time_millis_ != -1) {
    int64_t now = TimeMillis();
    if (now - last_process_time_millis_ < kSendIntervalMillis)
      return last_process_time_millis_ + kSendIntervalMillis - now;
  }
  return 0;
}

void ReceiveSideTWCC::Process() {
  last_process_time_millis_ = TimeMillis();
  SendPeriodicFeedbacks();
}

void ReceiveSideTWCC::OnTimerTimeout() {
  Process();
  timer_->AsyncWait(TimeUntilNextProcess());
}

void ReceiveSideTWCC::MaybeCullOldPackets(int64_t sequence_number, int64_t arrival_time_ms) {
  if (periodic_window_start_seq_.has_value()) {
    if (*periodic_window_start_seq_ >= packet_arrival_times_.end_sequence_number()) {
      // Start new feedback packet, cull old packets.
      packet_arrival_times_.RemoveOldPackets(sequence_number, arrival_time_ms - kBackWindowMillis);
    }
  }
}

void ReceiveSideTWCC::SendPeriodicFeedbacks() {
  // `periodic_window_start_seq_` is the first sequence number to include in
  // the current feedback packet. Some older may still be in the map, in case
  // a reordering happens and we need to retransmit them.
  if (!periodic_window_start_seq_)
    return;
  int64_t packet_arrival_times_end_seq = packet_arrival_times_.end_sequence_number();
  while (periodic_window_start_seq_ < packet_arrival_times_end_seq) {
    auto feedback_packet = MaybeBuildFeedbackPacket(
        /*include_timestamps=*/true, periodic_window_start_seq_.value(), packet_arrival_times_end_seq,
        /*is_periodic_update=*/true);

    if (!feedback_packet)
      break;
    auto shared = observer_.lock();
    if (shared)
      shared->OnReceiveSideTwccSendTransportFeedback(std::move(feedback_packet));
  }
}

std::unique_ptr<TransportFeedback> ReceiveSideTWCC::MaybeBuildFeedbackPacket(bool include_timestamps,
                                                                             int64_t begin_sequence_number_inclusive,
                                                                             int64_t end_sequence_number_exclusive,
                                                                             bool is_periodic_update) {
  DCHECK(begin_sequence_number_inclusive < end_sequence_number_exclusive);

  int64_t start_seq = packet_arrival_times_.clamp(begin_sequence_number_inclusive);

  int64_t end_seq = packet_arrival_times_.clamp(end_sequence_number_exclusive);

  // Create the packet on demand, as it's not certain that there are packets
  // in the range that have been received.
  std::unique_ptr<TransportFeedback> feedback_packet = nullptr;

  int64_t next_sequence_number = begin_sequence_number_inclusive;

  for (int64_t seq = start_seq; seq < end_seq; ++seq) {
    int64_t arrival_time_ms = packet_arrival_times_.get(seq);
    if (arrival_time_ms == 0) {
      // Packet not received.
      continue;
    }

    if (feedback_packet == nullptr) {
      feedback_packet = std::make_unique<TransportFeedback>(include_timestamps);
      feedback_packet->SetMediaSsrc(media_ssrc_);
      // Base sequence number is the expected first sequence number. This is
      // known, but we might not have actually received it, so the base time
      // shall be the time of the first received packet in the feedback.
      feedback_packet->SetBase(static_cast<uint16_t>(begin_sequence_number_inclusive & 0xFFFF), arrival_time_ms * 1000);
      feedback_packet->SetFeedbackSequenceNumber(feedback_packet_count_++);
    }

    if (!feedback_packet->AddReceivedPacket(static_cast<uint16_t>(seq & 0xFFFF), arrival_time_ms * 1000))
      // Could not add timestamp, feedback packet might be full. Return and
      // try again with a fresh packet.
      break;
    next_sequence_number = seq + 1;
  }
  if (is_periodic_update)
    periodic_window_start_seq_ = next_sequence_number;
  return feedback_packet;
}