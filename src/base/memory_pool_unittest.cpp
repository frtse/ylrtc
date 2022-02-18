#include "memory_pool.h"

#include "gtest/gtest.h"

TEST(MemoryPool, ReuseTest) {
  MemoryPool mp;
  auto p1 = mp.AllocMemory(100);
  EXPECT_TRUE(p1);
  uint8_t* addr_p1 = p1.get();
  p1.reset();
  auto p2 = mp.AllocMemory(100);
  EXPECT_TRUE(p2);
  uint8_t* addr_p2 = p2.get();
  EXPECT_EQ(addr_p1, addr_p2);
}

TEST(MemoryPool, DifferentLevelsTest) {
  MemoryPool mp;
  auto p1 = mp.AllocMemory(1400);
  EXPECT_TRUE(p1);
  uint8_t* addr_p1 = p1.get();
  p1.reset();
  auto p2 = mp.AllocMemory(100);
  EXPECT_TRUE(p2);
  uint8_t* addr_p2 = p2.get();
  EXPECT_NE(addr_p1, addr_p2);
}