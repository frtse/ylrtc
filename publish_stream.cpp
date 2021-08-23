#include "publish_stream.h"

#include "rtcp_packet.h"

PublishStream::PublishStream(const std::string& stream_id, Observer* observer)
    : WebrtcStream(stream_id, observer) {}

bool PublishStream::SetRemoteDescription(const std::string& offer) {
  return sdp_.SetPublishOffer(offer);
}

std::string PublishStream::CreateAnswer() {
  return sdp_.CreatePublishAnswer();
}

void PublishStream::OnRtpPacketReceive(uint8_t* data, size_t length) {
  std::shared_ptr<RtpPacket> rtp_packet = std::make_shared<RtpPacket>();
  if (!rtp_packet->Create(data, length))
    return;
  for (auto observer : data_observers_)
    observer->OnPublishStreamRtpPacketReceive(rtp_packet);
}

void PublishStream::SendRequestkeyFrame() {
  work_thread_->PostAsync([this] {
    auto video_ssrc = sdp_.GetPrimarySsrc("video");
    if (!video_ssrc)
      return;
    // RtcpPliPacket pli;
    // pli.SetSenderSsrc(*video_ssrc);
    // pli.SetMediaSsrc(*video_ssrc);
    // uint8_t buffer[1500];
    // ByteWriter byte_write(buffer, 1500);
    // pli.Serialize(&byte_write);
    // SendRtcp(byte_write.Data(), byte_write.Used());
    RtcpFirPacket fir;
    fir.SetSenderSsrc(*video_ssrc);
    fir.AddFciEntry(*video_ssrc, 111);
    uint8_t buffer[1500];
    ByteWriter byte_write(buffer, 1500);
    fir.Serialize(&byte_write);
    SendRtcp(byte_write.Data(), byte_write.Used());
  });
}

void PublishStream::RegisterDataObserver(DataObserver* observer) {
  work_thread_->PostSync([this, observer]() {
    auto result = std::find(data_observers_.begin(), data_observers_.end(), observer);
    if (result == data_observers_.end())
      data_observers_.push_back(observer);
  });
}

void PublishStream::UnregisterDataObserver(DataObserver* observer) {
  work_thread_->PostSync([this, observer]() {
    auto result = std::find(data_observers_.begin(), data_observers_.end(), observer);
    if (result != data_observers_.end())
      data_observers_.erase(result);
  });
}

void PublishStream::OnRtcpPacketReceive(uint8_t* data, size_t length) {}

void PublishStream::SetLocalDescription() {
}
