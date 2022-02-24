#include <sys/resource.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

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
  // Check the number of command line arguments.
  if (argc != 2) {
    spdlog::error("Parameter error. Usage: ylrtc [Configuration file path].");
    return EXIT_FAILURE;
  }

  // load configuration file.
  if (!ServerConfig::GetInstance().Load(argv[1])) {
    spdlog::error("Failed to load configuration file.");
    return EXIT_FAILURE;
  }
  spdlog::info("Configuration file loaded successfully.");

  // Whether to run as a daemon.
  if (ServerConfig::GetInstance().RunAsDaemon()) {
    pid_t pid = fork();
    if (pid < 0) {
      spdlog::error("Fork error.");
      return EXIT_FAILURE;
    }
    if (pid > 0)
      return EXIT_SUCCESS;
    if (setsid() < 0)
      return EXIT_SUCCESS;
    pid = fork();
    if (pid < 0) {
      spdlog::error("Fork error.");
      return EXIT_FAILURE;
    }
    if (pid > 0)
      return EXIT_SUCCESS;
    umask(0);
    spdlog::info("Daemon starts running.");
  }

  // Configure log.
#ifdef NDEBUG
  spdlog::set_level(spdlog::level::info);
  // Create a file rotating logger with 5mb size max and 3 rotated files.
  auto max_size = 1048576 * 5;
  auto max_files = 3;
  auto logger =
      spdlog::rotating_logger_mt("ylrtc", ServerConfig::GetInstance().LogDirectory().data() + std::string("/ylrtc.txt"), max_size, max_files);
  spdlog::set_default_logger(logger);
#else
  spdlog::set_level(spdlog::level::debug);
  auto console = spdlog::stdout_color_mt("ylrtc");
  spdlog::set_default_logger(console);
#endif

  // Enable core dump.
  rlimit l = {RLIM_INFINITY, RLIM_INFINITY};
  if (setrlimit(RLIMIT_CORE, &l) != 0) {
    spdlog::warn("Core dumps may be truncated or non-existant.");
  }

  // Create a test room with id 9527.
  RoomManager::GetInstance().CreateRoom("9527");
  if (!WebrtcStreamProxy::GetInstance()->Start()) {
    spdlog::error("Failed to start webrtc stream proxy.");
    return EXIT_FAILURE;
  }

  // Initialize dtls context。
  if (!DtlsContext::GetInstance().Initialize()) {
    spdlog::error("Failed to initialize DTLS.");
    return EXIT_FAILURE;
  }

  // Load certificate。
  if (!SignalingServer::GetInstance().LoadCertKeyFile(ServerConfig::GetInstance().CertFile(), ServerConfig::GetInstance().KeyFile())) {
    spdlog::error("Load file failed.");
    return EXIT_FAILURE;
  }

  // Start signaling service.
  if (!SignalingServer::GetInstance().Start(ServerConfig::GetInstance().LocalIp(), ServerConfig::GetInstance().SignalingServerPort())) {
    spdlog::error("Signaling server failed to start.");
    return EXIT_FAILURE;
  }
  spdlog::info("Signaling service listening {} port.", ServerConfig::GetInstance().SignalingServerPort());

  // Capture signal.
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