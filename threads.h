#pragma once

#include <boost/asio.hpp>
#include <future>
#include <memory>
#include <thread>
#include <unordered_map>

/**
 * @brief Base class of thread.
 *
 */
class Thread {
 public:
  /**
   * @brief Ask this thread to execute given handler asynchronously.
   *
   * @param f The handler to be called.
   */
  template <typename F>
  void PostAsync(F&& f) {
    boost::asio::post(message_loop_, [f = std::forward<F>(f)] { f(); });
  }

  /**
   * @brief Ask this thread to execute given handler synchronously.
   *
   * @param f The handler to be called.
   */
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

  /**
   * @brief Return the internal boost ASIO iocontext.
   *
   * @return boost::asio::io_context&
   */
  boost::asio::io_context& MessageLoop();

  /**
   * @brief Assert that the code here runs in this thread.
   *
   */
  void AssertInThisThread();

  /**
   * @brief Gets the ID of the internal thread.
   *
   * @return thread ID.
   */
  std::thread::id Id();

 protected:
  boost::asio::io_context message_loop_;
  std::thread::id thread_id_;
};

/**
 * @brief Main thread, which is used to process signaling and signals.
 *
 */
class MainThread : public Thread {
 public:
  /**
   * @brief Return a globally unique MainThread object.
   *
   * @return MainThread&
   */
  static MainThread& GetInstance();

 private:
  MainThread();
};

/**
 * @brief Worker thread, which is used to handle Webrtc connections.
 *
 */
class WorkerThread : public Thread {
 public:
  WorkerThread();
  ~WorkerThread();

 private:
  using work_guard_type = boost::asio::executor_work_guard<boost::asio::io_context::executor_type>;
  work_guard_type work_guard_;
  std::thread work_thread_;
};

/**
 * @brief Worker thread pool.
 *
 */
class WorkerThreadPool {
 public:
  static constexpr uint32_t kDefaultThreadCount = 1;
  static WorkerThreadPool& GetInstance();

  /**
   * @brief Gets the least used thread in the thread pool.
   *
   * @return std::shared_ptr<WorkerThread>
   */
  std::shared_ptr<WorkerThread> GetWorkerThread();

  /**
   * @brief Query thread with thread ID.
   *
   * @param id thread ID.
   */
  std::shared_ptr<WorkerThread> GetThreadById(const std::thread::id& id);

  /**
   * @brief Stop all threads in the thread pool.
   *
   */
  void StopAll();

 private:
  WorkerThreadPool();
  std::unordered_map<std::thread::id, std::shared_ptr<WorkerThread>> work_threads_;
};