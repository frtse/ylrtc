#pragma once

#include <boost/asio.hpp>
#include <memory>
#include <thread>

class Timer : public std::enable_shared_from_this<Timer> {
 public:
  class Observer {
   public:
    virtual ~Observer() = default;
    virtual void OnTimerTimeout() = 0;
  };

 public:
  Timer(boost::asio::io_context& io_context, std::weak_ptr<Observer> observer);
  Timer& operator=(const Timer&) = delete;
  Timer(const Timer&) = delete;
  ~Timer();

  void AsyncWait(uint64_t timeout);

 private:
  void OnTimeout(const boost::system::error_code& ec);
  boost::asio::io_context& io_context_;
  std::unique_ptr<boost::asio::deadline_timer> timer_;
  std::weak_ptr<Observer> observer_;
};