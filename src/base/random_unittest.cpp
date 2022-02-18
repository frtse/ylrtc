#include "random.h"

#include "gtest/gtest.h"

TEST(Random, CommonTest) {
  Random random;
  auto number_value = random.RandomNumber(100, 110);
  EXPECT_GE(number_value, 100);
  EXPECT_LE(number_value, 110);
  auto string_value = random.RandomString(24);
  EXPECT_EQ(string_value.size(), 24);
}