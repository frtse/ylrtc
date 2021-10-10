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
  if (argc != 2) {
    spdlog::error("Parameter error. Usage: WebrtcSFU [Configuration file path].");
    return EXIT_FAILURE;
  }
  RoomManager::GetInstance().CreateRoom("AABBCCDDEEAABBCCDDEEAABBCCDDEEAABBCCDDEEAABBCCDDEEAABBCCDDEEABCD");
#ifdef NDEBUG
  spdlog::set_level(spdlog::level::info);
#else
  spdlog::set_level(spdlog::level::debug);
#endif

  rlimit l = {RLIM_INFINITY, RLIM_INFINITY};
  setrlimit(RLIMIT_CORE, &l);

  if (!ServerConfig::GetInstance().Load(argv[1])) {
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

  if (!SignalingServer::GetInstance().LoadCertKeyFile(ServerConfig::GetInstance().GetCertFile(), ServerConfig::GetInstance().GetKeyFile())) {
    spdlog::error("Load file failed.");
    return EXIT_FAILURE;
  }
  if (!SignalingServer::GetInstance().Start(ServerConfig::GetInstance().GetIp(), ServerConfig::GetInstance().GetSignalingServerPort())) {
    spdlog::error("Signaling server failed to start.");
    return EXIT_FAILURE;
  }

  boost::asio::signal_set signals(MainThread::GetInstance().MessageLoop(), SIGINT);
  signals.async_wait([&](const boost::system::error_code &error, int signal_number) {
    if (signal_number == SIGINT && !error) {
      spdlog::info("Recv signal {}, Exit eventloop.", signal_number);
      MainThread::GetInstance().MessageLoop().stop();
    }
  });
  MainThread::GetInstance().MessageLoop().run();
  RoomManager::GetInstance().Clear();
  return EXIT_SUCCESS;
}