#include "sdp_negotiator.h"

#include <regex>
#include <string>

#include "rtp_header_extension.h"
#include "rtp_utils.h"
#include "spdlog/spdlog.h"
#include "utils.h"
#include "dtls_transport.h"
#include "server_config.h"

SdpNegotiator::SdpNegotiator() : local_dtls_setup_{"active"} {}

bool SdpNegotiator::SetPublishOffer(const std::string& offer) {
  try {
    auto publish_offer_sdp = sdptransform::parse(offer);
    if (publish_offer_sdp.find("media") == publish_offer_sdp.end() || publish_offer_sdp.at("media").empty()) {
      spdlog::error("No media section.");
      return false;
    }

    // https://datatracker.ietf.org/doc/html/draft-ietf-mmusic-sdp-bundle-negotiation
    if (publish_offer_sdp.find("groups") != publish_offer_sdp.end()) {
      auto& groups = publish_offer_sdp.at("groups");
      auto result = std::count_if(groups.cbegin(), groups.cend(), [](auto obj) { return obj.at("type") == "BUNDLE"; });
      if (result != 1) {
        spdlog::error("Only support one BUNDLE.");
        return false;
      }
    } else {
      spdlog::error("No BUNDLE.");
      return false;
    }

    auto& media = publish_offer_sdp.at("media");
    for (int i = 0; i < media.size(); ++i) {
      auto& media_section = media[i];
      if (media_section.find("direction") == media_section.end() || media_section.at("direction") != "sendonly")
        return false;
      const std::string& media_type = media_section.at("type");
      if (media_section.find("ssrcs") != media_section.end())
        media_section_ssrcs_map_[media_type] = media_section.at("ssrcs");
      if (media_section.find("ssrcGroups") != media_section.end())
        media_section_ssrc_groups_map_[media_type] = media_section.at("ssrcGroups");

      if (media_section.find("setup") != media_section.end())
        remote_dtls_setup_ = media_section.at("setup");
      else
        return false;
      if (media_section.find("iceUfrag") != media_section.end())
        remote_ice_ufrag_ = media_section.at("iceUfrag");
      else
        return false;
      if (media_section.find("icePwd") != media_section.end())
        remote_ice_pwd_ = media_section.at("icePwd");
      else
        return false;
      if (media_section.find("fingerprint") != media_section.end()) {
        auto& fingerprint = media_section.at("fingerprint");
        remote_fingerprint_type_ = fingerprint.at("type");
        remote_fingerprint_hash_ = fingerprint.at("hash");
      }
      else if (publish_offer_sdp.find("fingerprint") != publish_offer_sdp.end()) {
        auto& fingerprint = publish_offer_sdp.at("fingerprint");
        remote_fingerprint_type_ = fingerprint.at("type");
        remote_fingerprint_hash_ = fingerprint.at("hash");
      }
      else
        return false;
    }
    publish_offer_sdp_ = publish_offer_sdp;
    return true;
  } catch (...) {
    return false;
  }
}

std::optional<std::string> SdpNegotiator::CreatePublishAnswer() {
  std::string video_codec = "VP8";
  std::string audio_codec = "opus";
  publish_anwser_sdp_ = publish_offer_sdp_;
  publish_anwser_sdp_.erase("iceOptions");
  publish_anwser_sdp_.erase("fingerprint");
  publish_anwser_sdp_.erase("direction");
  publish_anwser_sdp_.erase("extmapAllowMixed");

  auto& media = publish_anwser_sdp_.at("media");
  for (int i = 0; i < media.size(); ++i) {
    auto& media_section = media[i];
    // https://datatracker.ietf.org/doc/html/draft-ietf-mmusic-sdp-bundle-negotiation-54#section-6
    // Make bundle-only unspecified.
    if (media_section.at("port") == 0)
      media_section["port"] = 9;
    media_section.erase("ssrcs");
    media_section.erase("ssrcGroups");
    media_section.erase("iceOptions");
    media_section.erase("candidates");
    media_section.erase("extmapAllowMixed");

    media_section["candidates"] = nlohmann::json::array();
    media_section["candidates"][0] = local_candidate_;
    media_section["direction"] = "recvonly";

    media_section["icePwd"] = local_ice_password_;
    media_section["iceUfrag"] = local_ice_ufrag_;
    media_section["icelite"] = "ice-lite";

    media_section["fingerprint"]["type"] = local_fingerprint_type_;
    media_section["fingerprint"]["hash"] = local_fingerprint_hash_;
    auto result_setup = DtlsTransport::SetupSelector(remote_dtls_setup_);
    DCHECK(result_setup);
    local_dtls_setup_ = *result_setup;
    media_section["setup"] = local_dtls_setup_;
    if (media_section.find("rids") != media_section.end()) {
      auto& rids = media_section.at("rids");
      for (auto& rid : rids) {
        if (rid.find("direction") != rid.end()) {
          rid.at("direction") = "recv";
        }
      }
    }

    if (media_section.find("simulcast") != media_section.end()) {
      auto& simulcast = media_section.at("simulcast");
      if (simulcast.find("dir1") != simulcast.end())
        simulcast.at("dir1") = "recv";
      if (simulcast.find("dir2") != simulcast.end())
        simulcast.at("dir2") = "recv";
    }

    std::string select_codec;
    const std::string& media_section_type = media_section.at("type");
    if (media_section_type == "video")
      select_codec = video_codec;
    else if (media_section_type == "audio")
      select_codec = audio_codec;
    else
      continue;

    int codec_payload = -1;
    if (media_section.find("rtp") != media_section.end()) {
      auto& rtp = media_section.at("rtp");
      for (auto& j : rtp) {
        if (j.at("codec") == select_codec) {
          codec_payload = j.at("payload");
          media_section_rtpmaps_map_[media_section_type].push_back(j);
          break;
        }
      }
      if (codec_payload == -1)
        return std::nullopt;
    }

    int rtx_payload = -1;
    if (media_section.find("fmtp") != media_section.end()) {
      auto& fmtp = media_section.at("fmtp");
      fmtp.erase(std::remove_if(fmtp.begin(), fmtp.end(),
                                [codec_payload, &rtx_payload](auto& item) {
                                  if (item.at("config") == "apt=" + std::to_string(codec_payload)) {
                                    rtx_payload = item.at("payload");
                                    return false;
                                  }
                                  return item.at("payload") != codec_payload;
                                }),
                 fmtp.end());
      if (ServerConfig::GetInstance().EnableDTX() && select_codec == "opus") {
        for (auto& f : fmtp) {
          if (f.at("payload") == codec_payload)
            f.at("config") = std::string(f.at("config")) + std::string(";usedtx=1");
        }
      }
    }

    if (media_section.find("rtp") != media_section.end()) {
      auto& rtp = media_section.at("rtp");
      rtp.erase(std::remove_if(rtp.begin(), rtp.end(),
                               [codec_payload, rtx_payload, this, media_section_type](auto& item) {
                                 auto& payload = item.at("payload");
                                 if (rtx_payload != -1 && payload == rtx_payload) {
                                   media_section_rtpmaps_map_[media_section_type].push_back(item);
                                   return false;
                                 } else if (payload == codec_payload)
                                   return false;
                                 else
                                   return true;
                               }),
                rtp.end());
    }

    if (media_section.find("rtcpFb") != media_section.end()) {
      auto& rtcp_fb = media_section.at("rtcpFb");
      rtcp_fb.erase(std::remove_if(rtcp_fb.begin(), rtcp_fb.end(),
                                   [codec_payload](auto& item) {
                                     return item.at("payload") != std::to_string(codec_payload) && item.at("payload") != "*";  // * todo
                                   }),
                    rtcp_fb.end());
    }

    if (media_section.find("rtcpFbTrrInt") != media_section.end()) {
      auto& rtcp_fb_trr_int = media_section.at("rtcpFbTrrInt");
      rtcp_fb_trr_int.erase(std::remove_if(rtcp_fb_trr_int.begin(), rtcp_fb_trr_int.end(),
                                           [codec_payload](auto& item) {
                                             return item.at("payload") != std::to_string(codec_payload) && item.at("payload") != "*";  // * todo
                                           }),
                            rtcp_fb_trr_int.end());
    }

    std::string payloads = rtx_payload == -1 ? std::to_string(codec_payload) : std::to_string(codec_payload) + " " + std::to_string(rtx_payload);
    media_section["payloads"] = payloads;
  }

  return sdptransform::write(publish_anwser_sdp_);
}

bool SdpNegotiator::SetSubscribeOffer(const std::string& offer) {
  subscribe_offer_sdp_ = sdptransform::parse(offer);
  if (subscribe_offer_sdp_.find("media") == subscribe_offer_sdp_.end() || subscribe_offer_sdp_.at("media").empty()) {
    spdlog::error("No media section.");
    return false;
  }

  const auto& media = subscribe_offer_sdp_.at("media");
  for (int i = 0; i < media.size(); ++i) {
    auto& media_section = media[i];
    if (media_section.find("setup") != media_section.end())
      remote_dtls_setup_ = media_section.at("setup");
    else
      return false;
    if (media_section.find("iceUfrag") != media_section.end())
      remote_ice_ufrag_ = media_section.at("iceUfrag");
    else
      return false;
    if (media_section.find("icePwd") != media_section.end())
      remote_ice_pwd_ = media_section.at("icePwd");
    else
      return false;
    if (media_section.find("fingerprint") != media_section.end()) {
      auto& fingerprint = media_section.at("fingerprint");
      remote_fingerprint_type_ = fingerprint.at("type");
      remote_fingerprint_hash_ = fingerprint.at("hash");
    }
    else if (subscribe_offer_sdp_.find("fingerprint") != subscribe_offer_sdp_.end()) {
      auto& fingerprint = subscribe_offer_sdp_.at("fingerprint");
      remote_fingerprint_type_ = fingerprint.at("type");
      remote_fingerprint_hash_ = fingerprint.at("hash");
    }
    else
      return false;
  }
  return true;
}

std::optional<std::string> SdpNegotiator::CreateSubscribeAnswer() {
  try {
    subscribe_anwser_sdp_ = publish_anwser_sdp_;
    if (subscribe_anwser_sdp_.find("media") == subscribe_anwser_sdp_.end())
      return std::nullopt;

    auto& media = subscribe_anwser_sdp_.at("media");
    for (int i = 0; i < media.size(); ++i) {
      auto& media_section = media[i];
      media_section["candidates"] = nlohmann::json::array();
      media_section["candidates"][0] = local_candidate_;
      media_section["direction"] = "sendonly";
      media_section["icePwd"] = local_ice_password_;
      media_section["iceUfrag"] = local_ice_ufrag_;
      nlohmann::json fingerprint;
      fingerprint["type"] = local_fingerprint_type_;
      fingerprint["hash"] = local_fingerprint_hash_;
      media_section["fingerprint"] = fingerprint;
      auto result_setup = DtlsTransport::SetupSelector(remote_dtls_setup_);
      DCHECK(result_setup);
      local_dtls_setup_ = *result_setup;
      media_section["setup"] = local_dtls_setup_;
      if (media_section_ssrcs_map_.find(media_section["type"]) != media_section_ssrcs_map_.end())
        media_section["ssrcs"] = media_section_ssrcs_map_.at(media_section["type"]);
      if (media_section_ssrc_groups_map_.find(media_section["type"]) != media_section_ssrc_groups_map_.end())
        media_section["ssrcGroups"] = media_section_ssrc_groups_map_.at(media_section["type"]);
      if (media_section.find("simulcast") != media_section.end()) {
        auto& simulcast = media_section.at("simulcast");
        if (simulcast.find("dir1") != simulcast.end())
          simulcast.at("dir1") = "send";
        if (simulcast.find("dir2") != simulcast.end())
          simulcast.at("dir2") = "send";
      }
      if (media_section.find("rids") != media_section.end()) {
        auto& rids = media_section.at("rids");
        for (auto& rid : rids) {
          if (rid.find("direction") != rid.end()) {
            rid.at("direction") = "send";
          }
        }
      }
      if (media_section.find("simulcast") != media_section.end()) {
        media_section.erase("ssrcs");
        media_section.erase("ssrcGroups");
        const std::string& msid = media_section.at("msid");
        auto pos = msid.find(" ");
        if (pos == std::string::npos)
          return std::nullopt;
        std::string cname = msid.substr(0, pos);
        nlohmann::json ssrcs = nlohmann::json::array();
        nlohmann::json ssrc;
        ssrc["id"] = kSimulcastSubscribeVideoSsrc;
        ssrc["attribute"] = "cname";
        ssrc["value"] = cname;
        ssrcs.push_back(ssrc);
        nlohmann::json rtx_ssrc;
        rtx_ssrc["id"] = kSimulcastSubscribeVideoRtxSsrc;
        rtx_ssrc["attribute"] = "cname";
        rtx_ssrc["value"] = cname;
        ssrcs.push_back(rtx_ssrc);
        media_section["ssrcs"] = ssrcs;
        nlohmann::json ssrc_groups = nlohmann::json::array();
        nlohmann::json ssrc_group;
        ssrc_group["semantics"] = "FID";
        ssrc_group["ssrcs"] = std::to_string(kSimulcastSubscribeVideoSsrc) + " " + std::to_string(kSimulcastSubscribeVideoRtxSsrc);
        ssrc_groups.push_back(ssrc_group);
        media_section["ssrcGroups"] = ssrc_groups;
      }
      media_section.erase("simulcast");
      media_section.erase("rids");
    }
    return sdptransform::write(subscribe_anwser_sdp_);
  } catch (...) {
    spdlog::error("Create subscribe answer failed.");
    return std::nullopt;
  }
}

void SdpNegotiator::SetLocalHostAddress(std::string_view ip, uint16_t port) {
  local_candidate_["foundation"] = "ylrtc";
  local_candidate_["component"] = kCandidateComponentRtp;
  local_candidate_["transport"] = "udp";
  local_candidate_["priority"] = kMaxIceCandidatePriority;
  local_candidate_["ip"] = ip;
  local_candidate_["port"] = port;
  local_candidate_["type"] = "host";
}

void SdpNegotiator::SetLocalIceInfo(const std::string& ufrag, const std::string& password) {
  local_ice_ufrag_ = ufrag;
  local_ice_password_ = password;
}

void SdpNegotiator::SetLocalFingerprint(const std::string& type, const std::string& hash) {
  local_fingerprint_type_ = type;
  local_fingerprint_hash_ = hash;
}

const std::string& SdpNegotiator::GetRemoteDtlsSetup() const {
  return remote_dtls_setup_;
}

const std::string& SdpNegotiator::GetRemoteIceUfrag() const {
  return remote_ice_ufrag_;
}

const std::string& SdpNegotiator::GetRemoteIcePasswd() const {
  return remote_ice_pwd_;
}

const std::string& SdpNegotiator::GetRemoteFingerprintType() const {
  return remote_fingerprint_type_;
}

const std::string& SdpNegotiator::GetRemoteFingerprintHash() const {
  return remote_fingerprint_hash_;
}

std::optional<uint32_t> SdpNegotiator::GetPrimarySsrc(const std::string& type) {
  auto result = media_section_ssrcs_map_.find(type);
  if (result == media_section_ssrcs_map_.end())
    return std::nullopt;
  auto& ssrcs = result->second;
  if (ssrcs.empty())
    return std::nullopt;
  return (uint32_t)ssrcs[0]["id"];
}

bool SdpNegotiator::HasVideo() const {
  return media_section_rtpmaps_map_.find("video") != media_section_rtpmaps_map_.end();
}

bool SdpNegotiator::HasAudio() const {
  return media_section_rtpmaps_map_.find("audio") != media_section_rtpmaps_map_.end();
}

const std::unordered_map<std::string, nlohmann::json>& SdpNegotiator::GetMediaSectionSsrcsMap() const {
  return media_section_ssrcs_map_;
}

const std::unordered_map<std::string, nlohmann::json>& SdpNegotiator::GetMediaSectionSsrcGroupsMap() const {
  return media_section_ssrc_groups_map_;
}

const std::unordered_map<std::string, nlohmann::json>& SdpNegotiator::GetMediaSectionRtpmapsMap() const {
  return media_section_rtpmaps_map_;
}

const nlohmann::json SdpNegotiator::GetMediaSections() const {
  nlohmann::json media_sections;
  if (subscribe_anwser_sdp_.find("media") != subscribe_anwser_sdp_.end()) {
    media_sections = subscribe_anwser_sdp_.at("media");
  } else if (publish_anwser_sdp_.find("media") != publish_anwser_sdp_.end()) {
    media_sections = publish_anwser_sdp_.at("media");
    for (auto& m : media_sections) {
      if (m.find("type") == m.end())
        continue;
      const std::string& media_type = m.at("type");
      if (media_section_ssrcs_map_.find(media_type) != media_section_ssrcs_map_.end()) {
        m["ssrcs"] = media_section_ssrcs_map_.at(media_type);
      }

      if (media_section_ssrc_groups_map_.find(media_type) != media_section_ssrc_groups_map_.end()) {
        m["ssrcGroups"] = media_section_ssrc_groups_map_.at(media_type);
      }
    }
  }
  return media_sections;
}