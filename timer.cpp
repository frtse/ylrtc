#include "timer.h"

#include <boost/bind/bind.hpp>

Timer::Timer(boost::asio::io_context& io_context, std::weak_ptr<Observer> observer)
    : io_context_{io_context}, timer_{std::make_unique<boost::asio::deadline_timer>(io_context_)}, observer_{observer} {}

Timer::~Timer() {
  timer_->cancel();
}

void Timer::AsyncWait(uint64_t timeout) {
  timer_->expires_from_now(boost::posix_time::milliseconds(timeout));
  timer_->async_wait(boost::bind(&Timer::OnTimeout, shared_from_this(), boost::asio::placeholders::error));
}

void Timer::OnTimeout(const boost::system::error_code& ec) {
  if (!ec) {
    auto sp = observer_.lock();
    if (sp)
      sp->OnTimerTimeout();
  }
}