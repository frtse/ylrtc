#include "gtest/gtest.h"

#include <sys/time.h>
#include <sys/resource.h>

#include "server_config.h"
#include "spdlog/spdlog.h"

int main(int argc, char** argv) {
  // Load configuration file. some tests require configuration file.
  if (!ServerConfig::GetInstance().Load("../conf/config.toml")) {
    spdlog::error("Failed to load configuration file.");
    return EXIT_FAILURE;
  }

  if (ServerConfig::GetInstance().CoreDump()) {
    // Enable core dump.
    rlimit l = {RLIM_INFINITY, RLIM_INFINITY};
    if (setrlimit(RLIMIT_CORE, &l) != 0) {
      spdlog::warn("Core dumps may be truncated or non-existant.");
    }
  }

  testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}