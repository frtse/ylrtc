#include "nack_requester.h"

#include <algorithm>

#include "spdlog/spdlog.h"
#include "utils.h"

const int kMaxPacketAge = 10000;
const int kMaxNackPackets = 1000;
const int kDefaultRttMs = 100;
const int kMaxNackRetries = 10;
const int kMaxReorderedPackets = 128;
const int kNumReorderingBuckets = 10;
const int kDefaultSendNackDelayMs = 0;
int64_t kUpdateIntervalMillis = 20;

NackRequester::NackInfo::NackInfo() : seq_num(0), send_at_seq_num(0), sent_at_time(-1), retries(0) {}

NackRequester::NackInfo::NackInfo(uint16_t seq_num, uint16_t send_at_seq_num, int64_t created_at_time)
    : seq_num(seq_num), send_at_seq_num(send_at_seq_num), created_at_time(created_at_time), sent_at_time(-1), retries(0) {}

NackRequester::NackRequester(boost::asio::io_context& io_context, Observer* observer)
    : io_context_{io_context}, observer_{observer}, initialized_(false), rtt_ms_(kDefaultRttMs), newest_seq_num_(0), send_nack_delay_ms_{10} {}

void NackRequester::Init() {
  timer_.reset(new Timer(io_context_, shared_from_this()));
  timer_->AsyncWait(kUpdateIntervalMillis);
}

void NackRequester::OnTimerTimeout() {
  std::vector<uint16_t> nack_batch = GetNackBatch(kTimeOnly);
  if (!nack_batch.empty()) {
    observer_->OnNackRequesterRequestNack(nack_batch);
  }
  timer_->AsyncWait(kUpdateIntervalMillis);
}

int NackRequester::OnReceivedPacket(uint16_t seq_num, bool is_keyframe) {
  return OnReceivedPacket(seq_num, is_keyframe, false);
}

int NackRequester::OnReceivedPacket(uint16_t seq_num, bool is_keyframe, bool is_recovered) {
  if (!initialized_) {
    newest_seq_num_ = seq_num;
    if (is_keyframe)
      keyframe_list_.insert(seq_num);
    initialized_ = true;
    return 0;
  }

  // Since the `newest_seq_num_` is a packet we have actually received we know
  // that packet has never been Nacked.
  if (seq_num == newest_seq_num_)
    return 0;
  if (AheadOf(newest_seq_num_, seq_num)) {
    // An out of order packet has been received.
    auto nack_list_it = nack_list_.find(seq_num);
    int nacks_sent_for_packet = 0;
    if (nack_list_it != nack_list_.end()) {
      nacks_sent_for_packet = nack_list_it->second.retries;
      nack_list_.erase(nack_list_it);
    }
    return nacks_sent_for_packet;
  }

  // Keep track of new keyframes.
  if (is_keyframe)
    keyframe_list_.insert(seq_num);

  // And remove old ones so we don't accumulate keyframes.
  auto it = keyframe_list_.lower_bound(seq_num - kMaxPacketAge);
  if (it != keyframe_list_.begin())
    keyframe_list_.erase(keyframe_list_.begin(), it);

  if (is_recovered) {
    recovered_list_.insert(seq_num);

    // Remove old ones so we don't accumulate recovered packets.
    auto it = recovered_list_.lower_bound(seq_num - kMaxPacketAge);
    if (it != recovered_list_.begin())
      recovered_list_.erase(recovered_list_.begin(), it);

    // Do not send nack for packets recovered by FEC or RTX.
    return 0;
  }

  AddPacketsToNack(newest_seq_num_ + 1, seq_num);
  newest_seq_num_ = seq_num;

  // Are there any nacks that are waiting for this seq_num.
  std::vector<uint16_t> nack_batch = GetNackBatch(kSeqNumOnly);
  if (!nack_batch.empty()) {
    // This batch of NACKs is triggered externally; the initiator can
    // batch them with other feedback messages.
    observer_->OnNackRequesterRequestNack(nack_batch);
  }

  return 0;
}

void NackRequester::ClearUpTo(uint16_t seq_num) {
  nack_list_.erase(nack_list_.begin(), nack_list_.lower_bound(seq_num));
  keyframe_list_.erase(keyframe_list_.begin(), keyframe_list_.lower_bound(seq_num));
  recovered_list_.erase(recovered_list_.begin(), recovered_list_.lower_bound(seq_num));
}

void NackRequester::UpdateRtt(int64_t rtt_ms) {
  rtt_ms_ = rtt_ms;
}

bool NackRequester::RemovePacketsUntilKeyFrame() {
  while (!keyframe_list_.empty()) {
    auto it = nack_list_.lower_bound(*keyframe_list_.begin());

    if (it != nack_list_.begin()) {
      // We have found a keyframe that actually is newer than at least one
      // packet in the nack list.
      nack_list_.erase(nack_list_.begin(), it);
      return true;
    }

    // If this keyframe is so old it does not remove any packets from the list,
    // remove it from the list of keyframes and try the next keyframe.
    keyframe_list_.erase(keyframe_list_.begin());
  }
  return false;
}

void NackRequester::AddPacketsToNack(uint16_t seq_num_start, uint16_t seq_num_end) {
  // Remove old packets.
  auto it = nack_list_.lower_bound(seq_num_end - kMaxPacketAge);
  nack_list_.erase(nack_list_.begin(), it);

  // If the nack list is too large, remove packets from the nack list until
  // the latest first packet of a keyframe. If the list is still too large,
  // clear it and request a keyframe.
  uint16_t num_new_nacks = ForwardDiff(seq_num_start, seq_num_end);
  if (nack_list_.size() + num_new_nacks > kMaxNackPackets) {
    while (RemovePacketsUntilKeyFrame() && nack_list_.size() + num_new_nacks > kMaxNackPackets) {
    }

    if (nack_list_.size() + num_new_nacks > kMaxNackPackets) {
      nack_list_.clear();
      spdlog::warn("NACK list full, clearing NACKlist and requesting keyframe.");
      observer_->OnNackRequesterRequestKeyFrame();
      return;
    }
  }

  for (uint16_t seq_num = seq_num_start; seq_num != seq_num_end; ++seq_num) {
    // Do not send nack for packets that are already recovered by FEC or RTX
    if (recovered_list_.find(seq_num) != recovered_list_.end())
      continue;
    NackInfo nack_info(seq_num, seq_num, TimeMillis());
    nack_list_[seq_num] = nack_info;
  }
}

std::vector<uint16_t> NackRequester::GetNackBatch(NackFilterOptions options) {
  bool consider_seq_num = options != kTimeOnly;
  bool consider_timestamp = options != kSeqNumOnly;
  int64_t now = TimeMillis();
  std::vector<uint16_t> nack_batch;
  auto it = nack_list_.begin();
  while (it != nack_list_.end()) {
    int64_t resend_delay = rtt_ms_;
    if (backoff_settings_) {
      resend_delay = std::max(resend_delay, backoff_settings_->min_retry_interval);
      if (it->second.retries > 1) {
        int64_t exponential_backoff = std::min(rtt_ms_, backoff_settings_->max_rtt) * std::pow(backoff_settings_->base, it->second.retries - 1);
        resend_delay = std::max(resend_delay, exponential_backoff);
      }
    }

    bool delay_timed_out = now - it->second.created_at_time >= send_nack_delay_ms_;
    bool nack_on_rtt_passed = now - it->second.sent_at_time >= resend_delay;
    bool nack_on_seq_num_passed = it->second.sent_at_time == -1 && AheadOrAt(newest_seq_num_, it->second.send_at_seq_num);
    if (delay_timed_out && ((consider_seq_num && nack_on_seq_num_passed) || (consider_timestamp && nack_on_rtt_passed))) {
      nack_batch.emplace_back(it->second.seq_num);
      ++it->second.retries;
      it->second.sent_at_time = now;
      if (it->second.retries >= kMaxNackRetries) {
        spdlog::warn("Sequence number {} removed from NACK list due to max retries.", it->second.seq_num);
        it = nack_list_.erase(it);
      } else {
        ++it;
      }
      continue;
    }
    ++it;
  }
  return nack_batch;
}