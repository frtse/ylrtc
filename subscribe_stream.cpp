#include "subscribe_stream.h"

#include "utils.h"
#include "spdlog/spdlog.h"
#include "rtcp_packet.h"

bool SubscribeStream::SetRemoteDescription(const std::string& offer) {
  return sdp_.SetSubscribeOffer(offer);
}

std::string SubscribeStream::CreateAnswer() {
  return sdp_.CreateSubscribeAnswer();
}

SubscribeStream::SubscribeStream(const std::string& stream_id, WebrtcStream::Observer* observer)
    : WebrtcStream(stream_id, observer) {}

SubscribeStream::~SubscribeStream() {
  for (auto track : tracks_)
    delete track;
}

void SubscribeStream::OnRtpPacketReceive(uint8_t* data, size_t length) {}

void SubscribeStream::OnRtcpPacketReceive(uint8_t* data, size_t length) {
  RtcpCompound rtcp_compound;
  if (!rtcp_compound.Parse(data, length)) {
    spdlog::warn("Failed to parse compound rtcp.");
    return;
  }
  auto rtcp_packets = rtcp_compound.GetRtcpPackets();
  for (auto p : rtcp_packets) {
    if (p->Type() == kRtcpTypeRtpfb) {
      if (p->Format() == 1) {
        NackPacket* nack_packet = dynamic_cast<NackPacket*>(p);
        tracks_[nack_packet->GetMediaSsrc()]->ReceiveNack(nack_packet);
      } else if (p->Format() == 15) {
        // twcc
      } else {
        spdlog::debug("fb format = {}", p->Format());
      }
    } else if (p->Type() == kRtcpTypeRr) {

    }
  }
}

void SubscribeStream::SetPublishSdp(const Sdp& publish_sdp) {
  sdp_ = publish_sdp;
}

void SubscribeStream::OnPublishStreamRtpPacketReceive(std::shared_ptr<RtpPacket> rtp_packet) {
  work_thread_->PostAsync([rtp_packet, this] {
    if (ssrc_track_map_.find(rtp_packet->Ssrc()) != ssrc_track_map_.end())
      ssrc_track_map_.at(rtp_packet->Ssrc())->SendRtpPacket(rtp_packet);
    else
      spdlog::error("Unrecognized RTP packet. ssrc = {}.", rtp_packet->Ssrc());
    
    SendRtp(rtp_packet->Data(), rtp_packet->Size());
  });
}

void SubscribeStream::SetLocalDescription() {
  auto& media_sections = sdp_.GetMediaSections();
  spdlog::debug("media_sections = {}", media_sections.dump());
  for (int i = 0; i < media_sections.size(); ++i) {
    SubscribeStreamTrack::Configuration config;
    auto& media_section = media_sections[i];
    if (media_section.find("ssrcs") != media_section.end()) {
      auto& ssrcs = media_section.at("ssrcs");
      if (!ssrcs.empty())
        config.ssrc = ssrcs[0].at("id");
    }
    if (media_section.find("rtp") != media_section.end()) {
      auto& rtpmaps= media_section.at("rtp");
      if (!rtpmaps.empty())
        config.payload_type = rtpmaps[0].at("payload");
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
          for (auto s : ssrcs)
            spdlog::debug("s = {}.", s);
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

    SubscribeStreamTrack* track = new SubscribeStreamTrack(config, this);
    tracks_.push_back(track);
    ssrc_track_map_.insert(std::make_pair(config.ssrc, track));

    spdlog::debug("SubscribeStreamTrack ssrc = {}, payload_type = {}"
      ", rtx_enabled = {}, rtx_ssrc = {}, rtx_payload_type = {}, nack_enabled = {}", config.ssrc
      , config.payload_type, config.rtx_enabled, config.rtx_ssrc, config.rtx_payload_type, config.nack_enabled);
  }
}

void SubscribeStream::OnSubscribeStreamTrackResendRtpPacket(std::shared_ptr<RtpPacket> rtp_packet) {
  SendRtp(rtp_packet->Data(), rtp_packet->Size());
}
