#include <sys/resource.h>

#include "boost/asio.hpp"
#include "dtls_context.h"
#include "room_manager.h"
#include "server_config.h"
#include "signaling_server.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/stdout_color_sinks.h"
#include "threads.h"

int main(int argc, char* argv[]) {
  if (argc != 2) {
    spdlog::error("Parameter error. Usage: WebrtcSFU [Configuration file path].");
    return EXIT_FAILURE;
  }
#ifdef NDEBUG
  spdlog::set_level(spdlog::level::info);
#else
  spdlog::set_level(spdlog::level::debug);
#endif
  auto console = spdlog::stdout_color_mt("console");
  spdlog::set_default_logger(console);

  rlimit l = {RLIM_INFINITY, RLIM_INFINITY};
  setrlimit(RLIMIT_CORE, &l);

  // Test room with id 9527.
  RoomManager::GetInstance().CreateRoom("9527");

  if (!ServerConfig::GetInstance().Load(argv[1])) {
    spdlog::error("Failed to load configuration file.");
    return EXIT_FAILURE;
  }
  spdlog::info("Configuration file loaded successfully.");

  if (!DtlsContext::GetInstance().Initialize()) {
    spdlog::error("Failed to initialize DTLS.");
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
  spdlog::info("Signaling service listening {} port.", ServerConfig::GetInstance().GetSignalingServerPort());

  boost::asio::signal_set signals(MainThread::GetInstance().MessageLoop(), SIGINT, SIGTERM);
  signals.async_wait([&](const boost::system::error_code &error, int signal_number) {
    if (!error && (signal_number == SIGINT || signal_number == SIGTERM)) {
      spdlog::info("Capture signal[{}], Perform a clean shutdown.", signal_number);
      SignalingServer::GetInstance().Close();
      RoomManager::GetInstance().Clear();
      WorkerThreadPool::GetInstance().StopAll();
    }
  });
  spdlog::info("Service started successfully");

  MainThread::GetInstance().MessageLoop().run();
  return EXIT_SUCCESS;
}