#pragma once

#include <cstdint>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>
#include <string_view>

#include "sdptransform/json.hpp"
#include "sdptransform/sdptransform.hpp"
#include "rtp_header_extension.h"

class Sdp {
 public:
  Sdp();
  bool SetPublishOffer(const std::string& offer);
  std::string CreatePublishAnswer();

  bool SetSubscribeOffer(const std::string& offer);
  std::string CreateSubscribeAnswer();
  void SetLocalHostAddress(std::string_view ip, uint16_t port);
  void SetLocalIceInfo(const std::string& ufrag, const std::string& password);
  void SetLocalFingerprint(const std::string& type, const std::string& hash);
  const std::string& GetRemoteDtlsSetup() const;
  const std::string& GetRemoteIceUfrag() const;
  const std::string& GetRemoteIcePasswd() const;
  const std::string& GetRemoteFingerprintType() const;
  const std::string& GetRemoteFingerprintHash() const;
  std::optional<uint32_t> GetPrimarySsrc(const std::string& type);
  bool HasVideo() const;
  bool HasAudio() const;

  const std::unordered_map<std::string, nlohmann::json>& GetMediaSectionSsrcsMap() const;
  const std::unordered_map<std::string, nlohmann::json>& GetMediaSectionSsrcGroupsMap() const;
  const std::unordered_map<std::string, nlohmann::json>& GetMediaSectionRtpmapsMap() const;
  const nlohmann::json GetMediaSections() const;
  RtpHeaderExtensionCapability GetRtpHeaderExtensionCapability();
 private:
  nlohmann::json publish_offer_sdp_;
  nlohmann::json publish_anwser_sdp_;
  nlohmann::json subscribe_offer_sdp_;
  nlohmann::json subscribe_anwser_sdp_;
  std::string remote_dtls_setup_;
  std::string remote_ice_ufrag_;
  std::string remote_ice_pwd_;
  std::string remote_fingerprint_type_;
  std::string remote_fingerprint_hash_;

  std::string local_dtls_setup_;
  std::string local_host_ip_;
  uint16_t local_host_port_;
  std::string local_ice_ufrag_;
  std::string local_ice_password_;
  std::string local_fingerprint_type_;
  std::string local_fingerprint_hash_;
  std::unordered_map<std::string, nlohmann::json> media_section_ssrcs_map_;
  std::unordered_map<std::string, nlohmann::json> media_section_ssrc_groups_map_;
  std::unordered_map<std::string, nlohmann::json> media_section_rtpmaps_map_;
};