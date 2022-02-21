#include "rtp_header_extension.h"

#include "gtest/gtest.h"

TEST(RtpHeaderExtension, CorrectnessTest) {
  RtpHeaderExtensionCapability test;
  test.Register(1, "urn:ietf:params:rtp-hdrext:ssrc-audio-level");
  test.Register(2, "urn:ietf:params:rtp-hdrext:toffset");
  test.Register(3, "http://www.webrtc.org/experiments/rtp-hdrext/inband-cn");
  EXPECT_EQ(test.GetTypeId(RTPHeaderExtensionType::kRtpExtensionAudioLevel), 1);
  EXPECT_EQ(test.GetTypeId(RTPHeaderExtensionType::kRtpExtensionTransmissionTimeOffset), 2);
  EXPECT_EQ(test.GetTypeId(RTPHeaderExtensionType::kRtpExtensionInbandComfortNoise), 3);
  EXPECT_EQ(test.GetIdType(1), RTPHeaderExtensionType::kRtpExtensionAudioLevel);
  EXPECT_EQ(test.GetIdType(2), RTPHeaderExtensionType::kRtpExtensionTransmissionTimeOffset);
  EXPECT_EQ(test.GetIdType(3), RTPHeaderExtensionType::kRtpExtensionInbandComfortNoise);
}