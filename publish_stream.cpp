#include "publish_stream.h"

#include "rtcp_packet.h"
#include "utils.h"
#include "rtp_utils.h"

PublishStream::PublishStream(const std::string& stream_id, WebrtcStream::Observer* observer)
    : WebrtcStream(stream_id, observer) {}

bool PublishStream::SetRemoteDescription(const std::string& offer) {
  return sdp_.SetPublishOffer(offer);
}

std::string PublishStream::CreateAnswer() {
  return sdp_.CreatePublishAnswer();
}

void PublishStream::OnRtpPacketReceive(uint8_t* data, size_t length) {
  
  std::shared_ptr<RtpPacket> rtp_packet = std::make_shared<RtpPacket>();
  if (!rtp_packet->CreateFromExistingMemory("vp8", data, length))
    return;
  auto ssrc = GetRtpSsrc(data, length);
  if (!ssrc)
    return;

  if (ssrc_track_map_.find(*ssrc) != ssrc_track_map_.end()) {
    ssrc_track_map_[*ssrc]->ReceiveRtpPacket(data, length);
  }
  else {
    spdlog::error("PublishStream: Unrecognized RTP packet. ssrc = {}.", *ssrc);
  }
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
  auto media_sections = sdp_.GetMediaSections();
  for (int i = 0; i < media_sections.size(); ++i) {
    PublishStreamTrack::Configuration config;
    auto& media_section = media_sections[i];
    if (media_section.find("ext") != media_section.end()) {
      for (auto& e : media_section.at("ext")) {
        config.id_extension_manager_.Register(e.at("value"), e.at("uri"));
      }
    }
    if (media_section.find("ssrcs") != media_section.end()) {
      auto& ssrcs = media_section.at("ssrcs");
      if (!ssrcs.empty())
        config.ssrc = ssrcs[0].at("id");
    }
    if (media_section.find("rtp") != media_section.end()) {
      auto& rtpmaps= media_section.at("rtp");
      if (!rtpmaps.empty()) {
        config.payload_type = rtpmaps[0].at("payload");
        config.codec = StringToLower(rtpmaps[0].at("codec"));
      }
      for (auto& rtpmap: rtpmaps) {
        if (rtpmap.at("codec") == "rtx") {
          config.rtx_enabled = true;
          config.rtx_payload_type = rtpmap.at("payload");
        }
      }
    }
    if (media_section.find("ssrcGroups") != media_section.end()) {
      auto& ssrc_groups = media_section.at("ssrcGroups");
      for (auto& ssrc_group : ssrc_groups) {
        if (ssrc_group.at("semantics") == "FID") {
          auto ssrcs = StringSplit(ssrc_group.at("ssrcs"), " ");
          if (ssrcs.size() == 2 && std::stol(ssrcs[0]) == config.ssrc)
            config.rtx_ssrc = std::stol(ssrcs[1]);
        }
      }
    }
    if (media_section.find("rtcpFb") != media_section.end()) {
     auto& rtcpFbs = media_section.at("rtcpFb");
      for (auto& rtcpFb : rtcpFbs) {
        if (rtcpFb.at("payload") == std::to_string(config.payload_type) 
          && rtcpFb.at("type") == "nack" && rtcpFb.find("subtype") == rtcpFb.end())
          config.nack_enabled = true;
      }
    }

    PublishStreamTrack* track = new PublishStreamTrack(config, work_thread_->MessageLoop(), this);
    tracks_.push_back(track);
    ssrc_track_map_.insert(std::make_pair(config.ssrc, track));
    if (config.rtx_enabled)
      ssrc_track_map_.insert(std::make_pair(config.rtx_ssrc, track));

    spdlog::debug("PublishStreamTrack ssrc = {}, payload_type = {}"
      ", rtx_enabled = {}, rtx_ssrc = {}, rtx_payload_type = {}, nack_enabled = {}", config.ssrc
      , config.payload_type, config.rtx_enabled, config.rtx_ssrc, config.rtx_payload_type, config.nack_enabled);
  }
}

void PublishStream::OnPublishStreamTrackReceiveRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) {
  for (auto observer : data_observers_)
    observer->OnPublishStreamRtpPacketReceive(rtp_packet);
}

void PublishStream::OnPublishStreamTrackSendRtcpPacket(uint8_t* data, size_t size) {
  SendRtcp(data, size);
}
