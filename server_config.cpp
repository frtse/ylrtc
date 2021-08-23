#include "server_config.h"

#include "spdlog/spdlog.h"
#include "toml.hpp"

ServerConfig& ServerConfig::GetInstance() {
  static ServerConfig server_config;
  return server_config;
}

bool ServerConfig::Load(std::string_view json_file_name) {
  try {
    const auto config_file = toml::parse(json_file_name.data());

    const auto& webrtc = toml::find(config_file, "webrtc");
    ip_ = toml::find<std::string>(webrtc, "ip");
    announced_ip_ = toml::find<std::string>(webrtc, "announcedIp");
    webrtc_min_port_ = toml::find<uint16_t>(webrtc, "webrtcMinPort");
    webrtc_max_port_ = toml::find<uint16_t>(webrtc, "webrtcMaxPort");

    const auto& signaling_server = toml::find(config_file, "signaling_server");
    signaling_server_port_ = toml::find<uint16_t>(signaling_server, "signalingServerPort");
    ssl_cert_file_ = toml::find<std::string>(signaling_server, "certFile");
    ssl_key_file_ = toml::find<std::string>(signaling_server, "keyFile");
  } catch (...) {
    spdlog::error("Parse config file failed.");
    return false;
  }

  return true;
}

const std::string& ServerConfig::GetIp() const {
  return ip_;
}

const std::string& ServerConfig::GetAnnouncedIp() const {
  return announced_ip_;
}

uint16_t ServerConfig::GetSignalingServerPort() const {
  return signaling_server_port_;
}

uint16_t ServerConfig::GetWebRtcMaxPort() const {
  return webrtc_max_port_;
}

uint16_t ServerConfig::GetWebRtcMinPort() const {
  return webrtc_min_port_;
}

const std::string ServerConfig::GetCertFile() {
  return ssl_cert_file_;
}

const std::string ServerConfig::GetKeyFile() {
  return ssl_key_file_;
}