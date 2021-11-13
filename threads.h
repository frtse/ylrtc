#pragma once

#include <boost/asio.hpp>
#include <future>
#include <memory>
#include <vector>
#include <thread>

class Thread {
 public:
  template <typename F>
  void PostAsync(F&& f) {
    boost::asio::post(message_loop_, [f = std::forward<F>(f)] { f(); });
  }

  template <typename F>
  void PostSync(F&& f) {
    std::promise<void> promise;
    auto future = promise.get_future();
    boost::asio::post(message_loop_, [&promise, f = std::forward<F>(f)]() {
      f();
      promise.set_value();
    });

    future.wait();
  }

  boost::asio::io_context& MessageLoop();

  void CheckInThisThread();

 protected:
  boost::asio::io_context message_loop_;
  std::thread::id thread_id_;
};

class MainThread : public Thread {
 public:
  static MainThread& GetInstance();

 private:
  MainThread();
};

class WorkerThread : public Thread {
 public:
  WorkerThread();
  ~WorkerThread();

 private:
  using work_guard_type = boost::asio::executor_work_guard<boost::asio::io_context::executor_type>;
  work_guard_type work_guard_;
  std::thread work_thread_;
};

class WorkerThreadPool {
 public:
  static WorkerThreadPool& GetInstance();

  std::shared_ptr<WorkerThread> GetWorkerThread();

  void StopAll();

 private:
  WorkerThreadPool();
  std::vector<std::shared_ptr<WorkerThread>> work_threads_;
};