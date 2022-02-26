#include "ice_lite.h"

#include <cstdint>

#include "gtest/gtest.h"
#include "utils.h"

/*  Test STUN message.
  Message Type: 0x0001 (Binding Request)
      .... ...0 ...0 .... = Message Class: 0x00 Request (0)
      ..00 000. 000. 0001 = Message Method: 0x0001 Binding (0x001)
      ..0. .... .... .... = Message Method Assignment: IETF Review (0x0)
  Message Length: 144
  Message Cookie: 2112a442
  Message Transaction ID: 4c4a4e664b692b314136612f
  Attributes
      USERNAME: 9527/wo1lami9p5tvgx0vt8gymdsdnlygh080mrw9cx35hlztr4q4ocdlvhuhf31zbxjz:Yqzh
          Attribute Type: USERNAME (0x0006)
              0... .... .... .... = Attribute Type Comprehension: Required (0x0)
              .0.. .... .... .... = Attribute Type Assignment: IETF Review (0x0)
          Attribute Length: 74
          Username: 9527/wo1lami9p5tvgx0vt8gymdsdnlygh080mrw9cx35hlztr4q4ocdlvhuhf31zbxjz:Yqzh
          Padding: 2
      Unknown
          Attribute Type: Unknown (0xc057)
              1... .... .... .... = Attribute Type Comprehension: Optional (0x1)
              .1.. .... .... .... = Attribute Type Assignment: Designated Expert (0x1)
          Attribute Length: 4
          Value: 00010000
      ICE-CONTROLLING
          Attribute Type: ICE-CONTROLLING (0x802a)
              1... .... .... .... = Attribute Type Comprehension: Optional (0x1)
              .0.. .... .... .... = Attribute Type Assignment: IETF Review (0x0)
          Attribute Length: 8
          Tie breaker: dfea83b5d622a01f
      USE-CANDIDATE
          Attribute Type: USE-CANDIDATE (0x0025)
              0... .... .... .... = Attribute Type Comprehension: Required (0x0)
              .0.. .... .... .... = Attribute Type Assignment: IETF Review (0x0)
          Attribute Length: 0
      PRIORITY
          Attribute Type: PRIORITY (0x0024)
              0... .... .... .... = Attribute Type Comprehension: Required (0x0)
              .0.. .... .... .... = Attribute Type Assignment: IETF Review (0x0)
          Attribute Length: 4
          Priority: 1853824767
      MESSAGE-INTEGRITY
          Attribute Type: MESSAGE-INTEGRITY (0x0008)
              0... .... .... .... = Attribute Type Comprehension: Required (0x0)
              .0.. .... .... .... = Attribute Type Assignment: IETF Review (0x0)
          Attribute Length: 20
          HMAC-SHA1: 6a7dc3a156a62666d744d5b6c71f1b03e962bda7
      FINGERPRINT
          Attribute Type: FINGERPRINT (0x8028)
              1... .... .... .... = Attribute Type Comprehension: Optional (0x1)
              .0.. .... .... .... = Attribute Type Assignment: IETF Review (0x0)
          Attribute Length: 4
          CRC-32: 0x2bf3601b
*/
static uint8_t kStunMessage[] = {
  0x00, 0x01, 0x00, 0x90, 0x21, 0x12, 0xa4, 0x42, 0x4c, 0x4a, 0x4e, 0x66, 0x4b, 0x69, 0x2b, 0x31,
  0x41, 0x36, 0x61, 0x2f, 0x00, 0x06, 0x00, 0x4a, 0x39, 0x35, 0x32, 0x37, 0x2f, 0x77, 0x6f, 0x31,
  0x6c, 0x61, 0x6d, 0x69, 0x39, 0x70, 0x35, 0x74, 0x76, 0x67, 0x78, 0x30, 0x76, 0x74, 0x38, 0x67,
  0x79, 0x6d, 0x64, 0x73, 0x64, 0x6e, 0x6c, 0x79, 0x67, 0x68, 0x30, 0x38, 0x30, 0x6d, 0x72, 0x77,
  0x39, 0x63, 0x78, 0x33, 0x35, 0x68, 0x6c, 0x7a, 0x74, 0x72, 0x34, 0x71, 0x34, 0x6f, 0x63, 0x64,
  0x6c, 0x76, 0x68, 0x75, 0x68, 0x66, 0x33, 0x31, 0x7a, 0x62, 0x78, 0x6a, 0x7a, 0x3a, 0x59, 0x71,
  0x7a, 0x68, 0x00, 0x00, 0xc0, 0x57, 0x00, 0x04, 0x00, 0x01, 0x00, 0x00, 0x80, 0x2a, 0x00, 0x08,
  0xdf, 0xea, 0x83, 0xb5, 0xd6, 0x22, 0xa0, 0x1f, 0x00, 0x25, 0x00, 0x00, 0x00, 0x24, 0x00, 0x04,
  0x6e, 0x7f, 0x1e, 0xff, 0x00, 0x08, 0x00, 0x14, 0x6a, 0x7d, 0xc3, 0xa1, 0x56, 0xa6, 0x26, 0x66,
  0xd7, 0x44, 0xd5, 0xb6, 0xc7, 0x1f, 0x1b, 0x03, 0xe9, 0x62, 0xbd, 0xa7, 0x80, 0x28, 0x00, 0x04,
  0x2b, 0xf3, 0x60, 0x1b
};

class IceLiteTest: public ::testing::Test, public IceLite::Observer {
 public:
  IceLiteTest() : ice_lite_{"9527", "wo1lami9p5tvgx0vt8gymdsdnlygh080mrw9cx35hlztr4q4ocdlvhuhf31zbxjz", "Yqzh", this} {
    ice_lite_.LocalPassword("k63cwbmb8kz8scl5l23ctaf2");
  }

  void Test() {
    boost::asio::ip::udp::endpoint ep(boost::asio::ip::make_address("127.0.0.1"), 6666);
    ice_lite_.ProcessStunMessage(kStunMessage, sizeof(kStunMessage) / sizeof(uint8_t), &ep);
    EXPECT_TRUE(ice_completed_);
    EXPECT_FALSE(ice_error_);
    EXPECT_EQ(*ice_lite_.SelectedCandidate(), ep);
  }

 private:
  void OnStunMessageSend(uint8_t* data, size_t size, udp::endpoint* ep) override {

  }

  void OnIceConnectionCompleted() override {
    ice_completed_ = true;
  }

  void OnIceConnectionError() override {
    ice_error_ = true;
  }

  IceLite ice_lite_;
  bool ice_error_{false};
  bool ice_completed_{false};
};

TEST_F(IceLiteTest, CommonTest) {
  Test();
}