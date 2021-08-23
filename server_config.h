#pragma once

#include <cstdint>
#include <string>
#include <string_view>

class ServerConfig {
 public:
  static ServerConfig& GetInstance();
  bool Load(std::string_view json_file_name);
  const std::string& GetIp() const;
  const std::string& GetAnnouncedIp() const;
  uint16_t GetSignalingServerPort() const;
  uint16_t GetWebRtcMaxPort() const;
  uint16_t GetWebRtcMinPort() const;
  const std::string GetCertFile();
  const std::string GetKeyFile();

 private:
  ServerConfig() = default;
  std::string ip_;
  std::string announced_ip_;
  uint16_t signaling_server_port_;
  uint16_t webrtc_max_port_;
  uint16_t webrtc_min_port_;
  std::string ssl_cert_file_;
  std::string ssl_key_file_;
};