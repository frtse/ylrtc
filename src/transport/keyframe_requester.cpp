#include "keyframe_requester.h"

#include "server_config.h"

KeyframeRequester::KeyframeRequester(boost::asio::io_context& io_context, std::weak_ptr<KeyframeRequesterObserver> observer) : io_context_{io_context}, observer_{observer} {

}

void KeyframeRequester::Start() {
  timer_.reset(new Timer(io_context_, shared_from_this()));
  timer_->AsyncWait(kKeyFrameRequestIntervalMillis);
}

void KeyframeRequester::Stop() {
  if (timer_)
    timer_->Stop();
}

void KeyframeRequester::KeyFrameRequest() {
  requested_ = true;
}

void KeyframeRequester::OnTimerTimeout() {
  if (requested_) {
    auto shared = observer_.lock();
    if (shared)
      shared->OnKeyframeRequesterRequest();
    requested_ = false;
  }
  timer_->AsyncWait(kKeyFrameRequestIntervalMillis);
}