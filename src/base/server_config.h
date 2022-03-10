#pragma once

#include <cstddef>
#include <cstdint>
#include <string>
#include <string_view>

/**
 * @brief Server configuration information.
 *
 */
class ServerConfig {
 public:
  static ServerConfig& GetInstance();
  bool Load(std::string_view json_file_name);
  std::string_view LocalIp() const;
  std::string_view AnnouncedIp() const;
  uint16_t SignalingServerPort() const;
  uint16_t WebRtcPort() const;
  uint32_t WebrtcWorkerThreadCount() const;
  std::string_view CertFile() const;
  std::string_view KeyFile() const;
  bool MemoryPoolEnabled() const;
  size_t MemoryPoolMaxListLength() const;
  std::string_view LogDirectory() const;
  bool RunAsDaemon() const;
  bool CoreDump() const;
  bool EnableDTX() const;

 private:
  ServerConfig() = default;
  std::string local_ip_;
  std::string announced_ip_;
  uint16_t signaling_server_port_;
  uint16_t webrtc_port_;
  uint32_t webrtc_worker_thread_count_;
  std::string ssl_cert_file_;
  std::string ssl_key_file_;
  bool memory_pool_enabled_;
  size_t memory_pool_max_list_length_;
  std::string log_directory_;
  bool run_as_daemon_;
  bool core_dump_;
  bool loaded_{false};
  bool enableDTX_{false};
};