#include "gtest/gtest.h"

#include "server_config.h"
#include "spdlog/spdlog.h"

int main(int argc, char** argv) {
  if (!ServerConfig::GetInstance().Load("../conf/config.toml")) {
    spdlog::error("Failed to load configuration file.");
    return EXIT_FAILURE;
  }
  testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}