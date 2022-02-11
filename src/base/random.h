#pragma once

#include <random>
#include <string>

class Random {
 public:
  Random();
  template <typename T>
  T RandomNumber(T min, T max) {
    std::uniform_int_distribution<T> dist(min, max);
    return dist(engine_);
  }
  std::string RandomString(size_t length);

 private:
  std::random_device device_;
  std::mt19937 engine_;
  static std::string characters_;
};