#pragma once

#include <cstdint>
#include <memory>
#include "timer.h"
#include "utils.h"

class KeyframeRequesterObserver {
 public:
  virtual void OnKeyframeRequesterRequest() = 0;
};

class KeyframeRequester : public Timer::Observer, public std::enable_shared_from_this<KeyframeRequester> {
 public:
  KeyframeRequester(boost::asio::io_context& io_context, std::weak_ptr<KeyframeRequesterObserver> observer);
  void Start();
  void Stop();
  void KeyFrameRequest();
 private:
  void OnTimerTimeout() override;
  static constexpr int64_t kKeyFrameRequestIntervalMillis = 1000;
  boost::asio::io_context& io_context_;
  std::shared_ptr<Timer> timer_;
  bool requested_{false};
  std::weak_ptr<KeyframeRequesterObserver> observer_;
};