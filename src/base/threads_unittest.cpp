#include "threads.h"

#include "gtest/gtest.h"

TEST(TheadsTest, PostAsyncTest) {
  bool flag = false;
  MainThread::GetInstance().PostAsync([&flag] { flag = true; });
  MainThread::GetInstance().PostAsync([&flag] { EXPECT_TRUE(flag); });
  MainThread::GetInstance().MessageLoop().run();
}

TEST(TheadsTest, WorkerThreadPoolTest) {
  EXPECT_TRUE(WorkerThreadPool::GetInstance().GetWorkerThread());
}

TEST(TheadsTest, AssertInThisThreadTest) {
  MainThread::GetInstance().AssertInThisThread();
  auto work_thread = WorkerThreadPool::GetInstance().GetWorkerThread();
  EXPECT_TRUE(work_thread);
  work_thread->PostAsync([work_thread] {work_thread->AssertInThisThread();});
  WorkerThreadPool::GetInstance().StopAll();
}