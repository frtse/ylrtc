#include "publish_stream_track.h"

#include <cstring>
#include "byte_buffer.h"
#include "rtp_utils.h"
#include "spdlog/spdlog.h"

PublishStreamTrack::PublishStreamTrack(const Configuration& configuration, Observer* observer)
  : configuration_{configuration}, observer_{observer} {

}

void PublishStreamTrack::ReceiveRtpPacket(uint8_t* data, size_t length) {
  auto ssrc = GetRtpSsrc(data, length);
  if (!ssrc)
    return;
  if (configuration_.rtx_enabled && configuration_.rtx_ssrc == *ssrc) {
    auto rtp_header_len = GetRtpHeaderLength(data, length);
    if (!rtp_header_len)
      return;
    SetSequenceNumber(data, length, LoadUInt16BE(data + *rtp_header_len));
		std::memmove(data + *rtp_header_len, data + *rtp_header_len + kRtxHeaderSize, length - *rtp_header_len - kRtxHeaderSize);
    length -= kRtxHeaderSize;
    SetRtpSsrc(data, length, configuration_.ssrc);
    SetPayloadType(data, length, configuration_.payload_type);
  }

  std::shared_ptr<RtpPacket> rtp_packet = std::make_shared<RtpPacket>();
  if (!rtp_packet->Create(data, length))
    return;
  observer_->OnPublishStreamTrackReceiveRtpPacket(rtp_packet);
}