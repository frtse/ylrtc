#include "threads.h"

#include "server_config.h"
#include "utils.h"

boost::asio::io_context& Thread::MessageLoop() {
  return message_loop_;
}

void Thread::AssertInThisThread() {
  CHECK(thread_id_ == std::this_thread::get_id());
}

std::thread::id Thread::Id() {
  return thread_id_;
}

std::shared_ptr<uint8_t> Thread::AllocMemory(size_t size) {
  return memory_pool_.GetMemory(size);
}

MainThread& MainThread::GetInstance() {
  static MainThread* instance = new MainThread;
  return *instance;
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
  return std::min_element(work_threads_.cbegin(), work_threads_.cend(), [](auto p1, auto p2) { return p1.second.use_count() < p2.second.use_count(); })->second;
}

std::shared_ptr<WorkerThread> WorkerThreadPool::GetThreadById(const std::thread::id& id) {
  if (work_threads_.find(id) == work_threads_.end())
    return nullptr;
  return work_threads_[id];
}

void WorkerThreadPool::StopAll() {
  work_threads_.clear();
}

WorkerThreadPool::WorkerThreadPool() {
  uint32_t thread_count = ServerConfig::GetInstance().GetWebrtcWorkerThreadCount();
  if (thread_count == 0) {
    thread_count = std::thread::hardware_concurrency();
    if (thread_count == 0)
      thread_count = kDefaultThreadCount;
  }
  for (int i = 0; i < thread_count; ++i) {
    auto worker = std::make_shared<WorkerThread>();
    work_threads_.insert(std::make_pair(worker->Id(), worker));
  }
}