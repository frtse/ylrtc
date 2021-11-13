#include "threads.h"

boost::asio::io_context& Thread::MessageLoop() {
  return message_loop_;
}

void Thread::CheckInThisThread() {
  if (thread_id_ != std::this_thread::get_id())
    abort();
}

MainThread& MainThread::GetInstance() {
  static MainThread instance;
  return instance;
}

MainThread::MainThread() {
  thread_id_ = std::this_thread::get_id();
}

WorkerThread::WorkerThread() : work_guard_(message_loop_.get_executor()) {
  if (work_thread_.get_id() == std::thread::id())
    work_thread_ = std::thread([this] { message_loop_.run(); });
  thread_id_ = work_thread_.get_id();
}

WorkerThread::~WorkerThread() {
  work_guard_.reset();
  if (work_thread_.joinable())
    work_thread_.join();
}

WorkerThreadPool& WorkerThreadPool::GetInstance() {
  static WorkerThreadPool instance;
  return instance;
}

std::shared_ptr<WorkerThread> WorkerThreadPool::GetWorkerThread() {
  return *std::min_element(work_threads_.begin(), work_threads_.end(), [](auto p1, auto p2) { return p1.use_count() < p2.use_count(); });
}

void WorkerThreadPool::StopAll() {
  work_threads_.clear();
}

WorkerThreadPool::WorkerThreadPool() {
  int threads = std::thread::hardware_concurrency();
  for (int i = 0; i < threads; ++i) {
    auto worker = std::make_shared<WorkerThread>();
    work_threads_.insert(worker);
  }
}