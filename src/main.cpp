#include <sys/resource.h>

#include "boost/asio.hpp"
#include "dtls_context.h"
#include "room_manager.h"
#include "server_config.h"
#include "signaling_server.h"
#include "spdlog/sinks/rotating_file_sink.h"
#include "spdlog/sinks/stdout_color_sinks.h"
#include "spdlog/spdlog.h"
#include "threads.h"
#include "webrtc_stream_proxy.h"

int main(int argc, char* argv[]) {
  if (argc != 2) {
    spdlog::error("Parameter error. Usage: WebrtcSFU [Configuration file path].");
    return EXIT_FAILURE;
  }

  if (!ServerConfig::GetInstance().Load(argv[1])) {
    spdlog::error("Failed to load configuration file.");
    return EXIT_FAILURE;
  }
  spdlog::info("Configuration file loaded successfully.");
#ifdef NDEBUG
  spdlog::set_level(spdlog::level::info);
  // Create a file rotating logger with 5mb size max and 3 rotated files.
  auto max_size = 1048576 * 5;
  auto max_files = 3;
  auto logger =
      spdlog::rotating_logger_mt("ylsfu", ServerConfig::GetInstance().LogDirectory().data() + std::string("/ylsfu.txt"), max_size, max_files);
  spdlog::set_default_logger(logger);
#else
  spdlog::set_level(spdlog::level::debug);
  auto console = spdlog::stdout_color_mt("ylsfu");
  spdlog::set_default_logger(console);
#endif
  rlimit l = {RLIM_INFINITY, RLIM_INFINITY};
  setrlimit(RLIMIT_CORE, &l);

  // Test room with id 9527.
  RoomManager::GetInstance().CreateRoom("9527");
  if (!WebrtcStreamProxy::GetInstance()->Start()) {
    spdlog::error("Failed to start webrtc stream proxy.");
    return EXIT_FAILURE;
  }

  if (!DtlsContext::GetInstance().Initialize()) {
    spdlog::error("Failed to initialize DTLS.");
    return EXIT_FAILURE;
  }

  if (!SignalingServer::GetInstance().LoadCertKeyFile(ServerConfig::GetInstance().CertFile(), ServerConfig::GetInstance().KeyFile())) {
    spdlog::error("Load file failed.");
    return EXIT_FAILURE;
  }

  if (!SignalingServer::GetInstance().Start(ServerConfig::GetInstance().LocalIp(), ServerConfig::GetInstance().SignalingServerPort())) {
    spdlog::error("Signaling server failed to start.");
    return EXIT_FAILURE;
  }
  spdlog::info("Signaling service listening {} port.", ServerConfig::GetInstance().SignalingServerPort());

  boost::asio::signal_set signals(MainThread::GetInstance().MessageLoop(), SIGINT, SIGTERM);
  signals.async_wait([&](const boost::system::error_code& error, int signal_number) {
    if (!error && (signal_number == SIGINT || signal_number == SIGTERM)) {
      spdlog::info("Capture signal[{}], Perform a clean shutdown.", signal_number);
      WebrtcStreamProxy::GetInstance()->Stop();
      SignalingServer::GetInstance().Close();
      RoomManager::GetInstance().Clear();
      WorkerThreadPool::GetInstance().StopAll();
    }
  });

  spdlog::info("Service started successfully");
  MainThread::GetInstance().MessageLoop().run();
  return EXIT_SUCCESS;
}