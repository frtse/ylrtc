#include "publish_stream.h"

#include <algorithm>

#include "byte_buffer.h"
#include "rtcp_packet.h"
#include "rtp_utils.h"
#include "spdlog/spdlog.h"
#include "subscribe_stream.h"
#include "utils.h"

PublishStream::PublishStream(const std::string& room_id, const std::string& stream_id, std::weak_ptr<WebrtcStream::Observer> observer)
    : WebrtcStream(room_id, stream_id, observer), has_video_{false}, has_audio_{false} {
  receive_side_twcc_.reset(new ReceiveSideTWCC(work_thread_->MessageLoop(), [this](std::vector<std::unique_ptr<RtcpPacket>> packets) {
    for (auto& packet : packets) {
      SendRtcp(*packet);
    }
  }));
  receive_side_twcc_->Init();
}

PublishStream::~PublishStream() {}

bool PublishStream::SetRemoteDescription(const std::string& offer) {
  return sdp_.SetPublishOffer(offer);
}

std::optional<std::string> PublishStream::CreateAnswer() {
  return sdp_.CreatePublishAnswer();
}

void PublishStream::OnRtpPacketReceive(uint8_t* data, size_t length) {
  std::shared_ptr<RtpPacket> rtp_packet = std::make_shared<RtpPacket>();
  if (!rtp_packet->Create(data, length))
    return;
  if (ssrc_track_map_.find(rtp_packet->Ssrc()) == ssrc_track_map_.end()) {
    for (const auto& extension_capability : extension_capabilities_) {
      rtp_packet->SetExtensionCapability(extension_capability);
      auto rid = rtp_packet->GetExtensionValue<RtpStreamIdExtension>();
      if (!rid) {
        rid = rtp_packet->GetExtensionValue<RepairedRtpStreamIdExtension>();
        if (!rid)
          continue;
      }
      auto& config = rid_configuration_map_.at(*rid);
      if (rtp_packet->PayloadType() == config.payload_type) {
        config.ssrc = rtp_packet->Ssrc();
        config.rid = *rid;
        config.extension_capability = extension_capability;
        std::shared_ptr<PublishStreamTrack> track = std::make_shared<PublishStreamTrack>(config, work_thread_->MessageLoop(), this);
        tracks_.push_back(track);
        ssrc_track_map_.insert(std::make_pair(config.ssrc, track));
      } else if (rtp_packet->PayloadType() == config.rtx_payload_type) {
        for (auto track : tracks_) {
          auto& track_config = track->Config();
          if (track_config.rid == *rid) {
            track_config.rtx_ssrc = rtp_packet->Ssrc();
            ssrc_track_map_.insert(std::make_pair(track_config.rtx_ssrc, track));
          }
        }
      }
    }
  }
  if (ssrc_track_map_.find(rtp_packet->Ssrc()) == ssrc_track_map_.end())
    return;
  rtp_packet->SetExtensionCapability(ssrc_track_map_.at(rtp_packet->Ssrc())->Config().extension_capability);
  auto twsn = rtp_packet->GetExtensionValue<TransportSequenceNumberExtension>();
  if (twsn)
    receive_side_twcc_->IncomingPacket(TimeMillis(), rtp_packet->Ssrc(), *twsn);
  ssrc_track_map_.at(rtp_packet->Ssrc())->ReceiveRtpPacket(rtp_packet);
  for (auto& observer : data_observers_)
    observer->OnPublishStreamRtpPacketReceive(rtp_packet);
}

void PublishStream::SendRequestkeyFrame() {
  auto self(shared_from_this());
  work_thread_->PostAsync([self, this] {
    for (auto& track : tracks_) {
      auto& config = track->Config();
      if (!config.audio)
        track->SendRequestkeyFrame();
    }
  });
}

void PublishStream::UpdateMuteInfo(const std::string& type, bool muted) {
  if (type == "audio")
    has_audio_ = !muted;
  else if (type == "video")
    has_video_ = !muted;
  else
    NOTREACHED();
}

bool PublishStream::HasVideo() const {
  return has_video_;
}

bool PublishStream::HasAudio() const {
  return has_audio_;
}

void PublishStream::Stop() {
  WebrtcStream::Stop();
  auto self(shared_from_this());
  work_thread_->PostAsync([self, this] {
    for (auto track : tracks_)
      track->Deinit();
      receive_side_twcc_->Deinit();
  });
}

void PublishStream::RegisterDataObserver(std::shared_ptr<SubscribeStream> observer) {
  auto self(shared_from_this());
  work_thread_->PostAsync([self, this, observer]() {
    auto result = std::find(data_observers_.cbegin(), data_observers_.cend(), observer);
    if (result == data_observers_.cend())
      data_observers_.push_back(observer);
  });
}

void PublishStream::UnregisterDataObserver(std::shared_ptr<SubscribeStream> observer) {
  auto self(shared_from_this());
  work_thread_->PostAsync([self, this, observer]() {
    auto result = std::find(data_observers_.cbegin(), data_observers_.cend(), observer);
    if (result != data_observers_.cend())
      data_observers_.erase(result);
  });
}

void PublishStream::OnRtcpPacketReceive(uint8_t* data, size_t length) {
  RtcpCompound rtcp_compound;
  if (!rtcp_compound.Parse(data, length)) {
    spdlog::warn("Failed to parse compound rtcp.");
    return;
  }
  auto rtcp_packets = rtcp_compound.GetRtcpPackets();
  for (auto p : rtcp_packets) {
    if (p->Type() == kRtcpTypeRtpfb) {
      if (p->Format() == 1) {
        // nack.
      } else if (p->Format() == 15) {
        // twcc.
      } else {
        spdlog::debug("fb format = {}", p->Format());
      }
    } else if (p->Type() == kRtcpTypeRr) {
      // rr
    } else if (p->Type() == kRtcpTypeXr) {
      XrPacket* xr = dynamic_cast<XrPacket*>(p);
      auto dlrr = xr->Dlrr();
      if (!dlrr)
        continue;
      const auto& sub_blocks = dlrr->SubBlocks();
      for (const auto& sub_block : sub_blocks) {
        auto stream_iter = ssrc_track_map_.find(sub_block.ssrc);
        if (stream_iter != ssrc_track_map_.end())
          stream_iter->second->ReceiveDlrrSubBlock(sub_block);
        else
          spdlog::error("Unknown XR packet.");
      }
    }
  }
}

void PublishStream::SetLocalDescription() {
  auto media_sections = sdp_.GetMediaSections();
  for (int i = 0; i < media_sections.size(); ++i) {
    PublishStreamTrack::Configuration config;
    bool has_ssrc = false;
    auto& media_section = media_sections[i];
    if (media_section.at("type") == "audio") {
      config.audio = true;
      has_audio_ = true;
    } else if (media_section.at("type") == "video") {
      has_video_ = true;
    }
    if (media_section.find("ssrcs") != media_section.end()) {
      auto& ssrcs = media_section.at("ssrcs");
      if (!ssrcs.empty()) {
        has_ssrc = true;
        config.ssrc = ssrcs[0].at("id");
      }
    }
    if (media_section.find("rtp") != media_section.end()) {
      auto& rtpmaps = media_section.at("rtp");
      if (!rtpmaps.empty()) {
        config.payload_type = rtpmaps[0].at("payload");
        config.codec = StringToLower(rtpmaps[0].at("codec"));
        config.clock_rate = rtpmaps[0].at("rate");
      }
      for (auto& rtpmap : rtpmaps) {
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
        if (rtcpFb.find("payload") == rtcpFb.end() || rtcpFb.find("type") == rtcpFb.end())
          continue;

        if (rtcpFb.find("subtype") == rtcpFb.end()) {
          if (rtcpFb.at("payload") == std::to_string(config.payload_type) && rtcpFb.at("type") == "nack")
            config.nack_enabled = true;
        } else {
          if (rtcpFb.at("subtype") == "fir")
            config.rtcpfb_fir = true;
          else if (rtcpFb.at("subtype") == "pli")
            config.rtcpfb_pli = true;
        }
      }
    }
    if (media_section.find("simulcast") != media_section.end()) {
      auto& simulcast = media_section.at("simulcast");
      if (simulcast.find("list1") != simulcast.end()) {
        std::string send_rids = simulcast.at("list1");
        auto result = StringSplit(send_rids, ";");  // TODO FIXME : example[1,2,3;~4,~5].
        for (auto& rid : result)
          rid_configuration_map_.insert(std::make_pair(rid, config));
      }
    }
    if (media_section.find("ext") != media_section.end()) {
      const auto& extensions = media_section.at("ext");
      for (const auto& extension : extensions)
        config.extension_capability.Register(extension.at("value"), extension.at("uri"));
      extension_capabilities_.push_back(config.extension_capability);
    }
    if (has_ssrc) {
      std::shared_ptr<PublishStreamTrack> track = std::make_shared<PublishStreamTrack>(config, work_thread_->MessageLoop(), this);
      track->Init();
      tracks_.push_back(track);
      ssrc_track_map_.insert(std::make_pair(config.ssrc, track));
      if (config.rtx_enabled)
        ssrc_track_map_.insert(std::make_pair(config.rtx_ssrc, track));
    }
    spdlog::debug(
        "PublishStreamTrack ssrc = {}, payload_type = {}"
        ", rtx_enabled = {}, rtx_ssrc = {}, rtx_payload_type = {}, nack_enabled = {}",
        config.ssrc, config.payload_type, config.rtx_enabled, config.rtx_ssrc, config.rtx_payload_type, config.nack_enabled);
  }
}

void PublishStream::OnPublishStreamTrackSendRtcpPacket(RtcpPacket& rtcp_packet) {
  SendRtcp(rtcp_packet);
}