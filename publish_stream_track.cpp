#include "publish_stream_track.h"

#include <cstring>

#include "byte_buffer.h"
#include "rtcp_packet.h"
#include "rtp_utils.h"
#include "spdlog/spdlog.h"

PublishStreamTrack::PublishStreamTrack(const Configuration& configuration, boost::asio::io_context& io_context, Observer* observer)
    : configuration_{configuration}, io_context_{io_context}, observer_{observer} {
  if (configuration_.nack_enabled) {
    nack_request_.reset(new NackRequester(io_context, this));
    nack_request_->Init();
  }
}

void PublishStreamTrack::ReceiveRtpPacket(uint8_t* data, size_t length) {
  auto ssrc = GetRtpSsrc(data, length);
  if (!ssrc)
    return;
  bool is_rtx = false;
  if (configuration_.rtx_enabled && configuration_.rtx_ssrc == *ssrc) {
    auto rtp_header_len = GetRtpHeaderLength(data, length);
    if (!rtp_header_len)
      return;
    SetSequenceNumber(data, length, LoadUInt16BE(data + *rtp_header_len));
    std::memmove(data + *rtp_header_len, data + *rtp_header_len + kRtxHeaderSize, length - *rtp_header_len - kRtxHeaderSize);
    length -= kRtxHeaderSize;
    SetRtpSsrc(data, length, configuration_.ssrc);
    SetPayloadType(data, length, configuration_.payload_type);
    is_rtx = true;
  }

  std::shared_ptr<RtpPacket> rtp_packet = std::make_shared<RtpPacket>();
  if (!rtp_packet->Create(configuration_.codec, data, length))
    return;
  if (configuration_.nack_enabled) {
    if (is_rtx)
      nack_request_->OnReceivedPacket(rtp_packet->SequenceNumber(), rtp_packet->IsKeyFrame(), true);
    else
      nack_request_->OnReceivedPacket(rtp_packet->SequenceNumber(), rtp_packet->IsKeyFrame());
  }
  observer_->OnPublishStreamTrackReceiveRtpPacket(rtp_packet);
}

void PublishStreamTrack::OnNackRequesterRequestNack(const std::vector<uint16_t>& nack_list) {
  NackPacket nack;
  nack.SetSenderSsrc(configuration_.ssrc);
  nack.SetMediaSsrc(configuration_.ssrc);
  nack.SetLostPacketSequenceNumbers(nack_list);
  uint8_t buffer[1500];
  ByteWriter byte_write(buffer, 1500);
  nack.Serialize(&byte_write);
  observer_->OnPublishStreamTrackSendRtcpPacket(byte_write.Data(), byte_write.Used());
}

void PublishStreamTrack::OnNackRequesterRequestKeyFrame() {
  RtcpFirPacket fir;
  fir.SetSenderSsrc(configuration_.ssrc);
  fir.AddFciEntry(configuration_.ssrc, 111);
  uint8_t buffer[1500];
  ByteWriter byte_write(buffer, 1500);
  fir.Serialize(&byte_write);
  observer_->OnPublishStreamTrackSendRtcpPacket(byte_write.Data(), byte_write.Used());
}