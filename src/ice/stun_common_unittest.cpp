#include "stun_common.h"

#include <string>

#include "gtest/gtest.h"

const char kTestUserName[] = "abcd:efgh";

static const unsigned char kStunMessageWithUsername[] = {
  0x00, 0x01, 0x00, 0x0c,
  0x21, 0x12, 0xa4, 0x42,
  0xe3, 0xa9, 0x46, 0xe1,
  0x7c, 0x00, 0xc2, 0x62,
  0x54, 0x08, 0x01, 0x00,
  0x00, 0x06, 0x00, 0x08,  // username attribute (length 9)
  0x61, 0x62, 0x63, 0x64,  // abcd:efgh
  0x3a, 0x65, 0x66, 0x67,
  0x68
};

TEST(STUN_COMMON, IsStun) {
  EXPECT_TRUE(IsStun((uint8_t*)kStunMessageWithUsername, sizeof(kStunMessageWithUsername) / sizeof(unsigned char)));
}

TEST(STUN_COMMON, MakeUfrag) {
  std::string expect_str = "roos/mike";
  EXPECT_EQ(MakeUfrag("roos", "mike"), expect_str);
}

TEST(STUN_COMMON, ExtractUfragInfo) {
  std::string ufrag = "111/222";
  std::string room_id;
  std::string stream_id;
  ExtractUfragInfo(ufrag, room_id, stream_id);
  EXPECT_EQ(room_id, "111");
  EXPECT_EQ(stream_id, "222");
}

TEST(STUN_COMMON, FastGetLocalUfrag) {
  auto result = FastGetLocalUfrag((uint8_t*)kStunMessageWithUsername, sizeof(kStunMessageWithUsername) / sizeof(unsigned char));
  ASSERT_TRUE(result);
  EXPECT_EQ(*result, "abcd");
}