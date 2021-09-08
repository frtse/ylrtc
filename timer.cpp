#include "timer.h"

#include <boost/bind/bind.hpp>

Timer::Timer(boost::asio::io_context& io_context, std::shared_ptr<Listener> listener)
    : io_context_{io_context}, timer_{std::make_unique<boost::asio::deadline_timer>(io_context_)}, listener_{listener} {}

Timer::~Timer() {
  timer_->cancel();
}

void Timer::AsyncWait(uint64_t timeout) {
  timer_->expires_from_now(boost::posix_time::milliseconds(timeout));
  timer_->async_wait(boost::bind(&Timer::OnTimeout, shared_from_this(), boost::asio::placeholders::error));
}

void Timer::OnTimeout(const boost::system::error_code& ec) {
  if (!ec) {
    auto listener_shared = listener_.lock();
    if (listener_shared)
      listener_shared->OnTimerTimeout();
  }
}