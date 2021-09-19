#include "publish_stream_track.h"

#include <cstring>

#include "byte_buffer.h"
#include "rtcp_packet.h"
#include "rtp_utils.h"
#include "spdlog/spdlog.h"
#include "utils.h"

PublishStreamTrack::PublishStreamTrack(const Configuration& configuration
  , boost::asio::io_context& io_context, ReceiveSideTWCC& bwe, Observer* observer)
  : configuration_{configuration}, io_context_{io_context}, receive_side_twcc_{bwe}, observer_{observer} {
  if (configuration_.nack_enabled) {
    nack_request_.reset(new NackRequester(io_context, this));
    nack_request_->Init();
  }
}

void PublishStreamTrack::ReceiveRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) {
  uint32_t original_ssrc = rtp_packet->Ssrc();
  bool is_rtx = false;
  if (configuration_.rtx_enabled && configuration_.rtx_ssrc == rtp_packet->Ssrc()) {
    rtp_packet->RtxRepaire(LoadUInt16BE(rtp_packet->Payload()), configuration_.payload_type, configuration_.ssrc);
    is_rtx = true;
  }

  if (!rtp_packet->ParsePayload(configuration_.codec))
    return;
  if (rtp_packet->IsKeyFrame())
    spdlog::debug("Recv key frame.");
  // TODO : Move this to PublishStream.
  uint32_t id = ServerSupportRtpExtensionIdMap::GetIdByType(RTPHeaderExtensionType::kRtpExtensionTransportSequenceNumber);
  auto twsn = rtp_packet->GetExtension<TransportSequenceNumberExtension>(id);
  if (twsn)
    receive_side_twcc_.IncomingPacket(TimeMillis(), original_ssrc, *twsn);
  if (configuration_.nack_enabled) {
    if (is_rtx)
      nack_request_->OnReceivedPacket(rtp_packet->SequenceNumber(), rtp_packet->IsKeyFrame(), true);
    else
      nack_request_->OnReceivedPacket(rtp_packet->SequenceNumber(), rtp_packet->IsKeyFrame());
  }

  observer_->OnPublishStreamTrackReceiveRtpPacket(rtp_packet);
}

PublishStreamTrack::Configuration& PublishStreamTrack::Config() {
  return configuration_;
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