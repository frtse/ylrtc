#pragma once

#include <cstdint>
#include <cstddef>
#include <string>
#include <string_view>

class ServerConfig {
 public:
  static ServerConfig& GetInstance();
  bool Load(std::string_view json_file_name);
  std::string_view GetIp() const;
  std::string_view GetAnnouncedIp() const;
  uint16_t GetSignalingServerPort() const;
  uint16_t GetWebRtcPort() const;
  uint32_t GetWebrtcWorkerThreadCount() const;
  std::string_view GetCertFile() const;
  std::string_view GetKeyFile() const;
  bool MemoryPoolEnabled() const;
  size_t MemoryPoolMaxListLength() const;

 private:
  ServerConfig() = default;
  std::string ip_;
  std::string announced_ip_;
  uint16_t signaling_server_port_;
  uint16_t webrtc_port_;
  uint32_t webrtc_worker_thread_count_;
  std::string ssl_cert_file_;
  std::string ssl_key_file_;
  bool memory_pool_enabled_;
  size_t memory_pool_max_list_length_;
};