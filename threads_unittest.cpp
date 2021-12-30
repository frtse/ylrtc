#include "threads.h"

#include "gtest/gtest.h"

TEST(TheadsTest, PostAsyncTest) {
  bool flag = false;
  MainThread::GetInstance().PostAsync([&flag] {
    flag = true;
  });
  MainThread::GetInstance().PostAsync([&flag] {
    EXPECT_TRUE(flag);
  });
  MainThread::GetInstance().MessageLoop().run();
}

TEST(TheadsTest, WorkerThreadPoolTest) {
  EXPECT_TRUE(WorkerThreadPool::GetInstance().GetWorkerThread());
}

TEST(TheadsTest, CheckInThisThreadTest) {
  MainThread::GetInstance().CheckInThisThread();
  auto work_thread = WorkerThreadPool::GetInstance().GetWorkerThread();
  EXPECT_TRUE(work_thread);
  work_thread->PostAsync([work_thread] {
    work_thread->CheckInThisThread();
  });
  WorkerThreadPool::GetInstance().StopAll();
}