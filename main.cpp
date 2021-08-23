#include <sys/resource.h>

#include <iostream>
#include <vector>

#include "boost/asio.hpp"
#include "dtls_context.h"
#include "hmac_sha1.h"
#include "room_manager.h"
#include "server_config.h"
#include "signaling_server.h"
#include "spdlog/spdlog.h"
#include "srtp_session.h"
#include "threads.h"

int main(int argc, char* argv[]) {
  RoomManager::GetInstance().CreateRoom(
      "AABBCCDDEEAABBCCDDEEAABBCCDDEEAABBCCDDEEAABBCCDDEEAABBCCDDEEABCD");
#ifdef NDEBUG
  spdlog::set_level(spdlog::level::info);
#else
  rlimit l = {RLIM_INFINITY, RLIM_INFINITY};
  setrlimit(RLIMIT_CORE, &l);
  spdlog::set_level(spdlog::level::debug);
#endif

  if (!ServerConfig::GetInstance().Load("../config.toml")) {
    spdlog::error("Failed to load config file.");
    return EXIT_FAILURE;
  }

  if (!DtlsContext::GetInstance().Initialize()) {
    spdlog::error("Failed to initialize dtls.");
    return EXIT_FAILURE;
  }

  if (!LibSrtpInitializer::GetInstance().Initialize()) {
    spdlog::error("Failed to initialize libsrtp.");
    return EXIT_FAILURE;
  }

  if (!SignalingServer::GetInstance().LoadCertKeyFile(ServerConfig::GetInstance().GetCertFile(),
                                                      ServerConfig::GetInstance().GetKeyFile())) {
    spdlog::error("Load file failed.");
    return EXIT_FAILURE;
  }
  if (!SignalingServer::GetInstance().Start(ServerConfig::GetInstance().GetIp(),
                                            ServerConfig::GetInstance().GetSignalingServerPort())) {
    spdlog::error("Signaling server failed to start.");
    return EXIT_FAILURE;
  }

  MainThread::GetInstance().MessageLoop().run();
  return EXIT_SUCCESS;
}