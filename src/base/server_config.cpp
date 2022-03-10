#include "server_config.h"

#include <exception>

#include "spdlog/spdlog.h"
#include "toml.hpp"
#include "utils.h"

ServerConfig& ServerConfig::GetInstance() {
  static ServerConfig server_config;
  return server_config;
}

bool ServerConfig::Load(std::string_view json_file_name) {
  try {
    const auto config_file = toml::parse(json_file_name.data());

    const auto& webrtc = toml::find(config_file, "webrtc");
    local_ip_ = toml::find<std::string>(webrtc, "localIp");
    announced_ip_ = toml::find<std::string>(webrtc, "announcedIp");
    webrtc_port_ = toml::find<uint16_t>(webrtc, "port");
    webrtc_worker_thread_count_ = toml::find<uint32_t>(webrtc, "workerThreadCount");
    enableDTX_ = toml::find<bool>(webrtc, "enableDTX");

    const auto& signaling_server = toml::find(config_file, "signaling_server");
    signaling_server_port_ = toml::find<uint16_t>(signaling_server, "port");
    ssl_cert_file_ = toml::find<std::string>(signaling_server, "certFile");
    ssl_key_file_ = toml::find<std::string>(signaling_server, "keyFile");

    const auto& memory_pool = toml::find(config_file, "memory_pool");
    memory_pool_enabled_ = toml::find<bool>(memory_pool, "enabled");
    memory_pool_max_list_length_ = toml::find<size_t>(memory_pool, "maxListLength");

    const auto& log = toml::find(config_file, "log");
    log_directory_ = toml::find<std::string>(log, "logDirectory");

    const auto& system = toml::find(config_file, "system");
    run_as_daemon_ = toml::find<bool>(system, "runAsdaemon");
    core_dump_ = toml::find<bool>(system, "coreDump");
  } catch (const std::exception& e) {
    spdlog::error("Parse config file failed. error: {}", e.what());
    return false;
  }

  loaded_ = true;
  return true;
}

std::string_view ServerConfig::LocalIp() const {
  DCHECK(loaded_);
  return local_ip_;
}

std::string_view ServerConfig::AnnouncedIp() const {
  DCHECK(loaded_);
  return announced_ip_;
}

uint16_t ServerConfig::SignalingServerPort() const {
  DCHECK(loaded_);
  return signaling_server_port_;
}

uint16_t ServerConfig::WebRtcPort() const {
  DCHECK(loaded_);
  return webrtc_port_;
}

uint32_t ServerConfig::WebrtcWorkerThreadCount() const {
  DCHECK(loaded_);
  return webrtc_worker_thread_count_;
}

std::string_view ServerConfig::CertFile() const {
  DCHECK(loaded_);
  return ssl_cert_file_;
}

std::string_view ServerConfig::KeyFile() const {
  DCHECK(loaded_);
  return ssl_key_file_;
}

bool ServerConfig::MemoryPoolEnabled() const {
  DCHECK(loaded_);
  return memory_pool_enabled_;
}

size_t ServerConfig::MemoryPoolMaxListLength() const {
  DCHECK(loaded_);
  return memory_pool_max_list_length_;
}

std::string_view ServerConfig::LogDirectory() const {
  DCHECK(loaded_);
  return log_directory_;
}

bool ServerConfig::RunAsDaemon() const {
  DCHECK(loaded_);
  return run_as_daemon_;
}

bool ServerConfig::CoreDump() const {
  DCHECK(loaded_);
  return core_dump_;
}

bool ServerConfig::EnableDTX() const {
  DCHECK(loaded_);
  return enableDTX_;
}