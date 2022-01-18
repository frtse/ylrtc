#pragma once

#include <cstdint>
#include <cstddef>
#include <list>
#include <memory>

class MemoryPool {
 public:
  static constexpr uint32_t kSizeThresholdLow = 750;
  static constexpr uint32_t kSizeThresholdHight = 1500;

  std::shared_ptr<uint8_t> GetMemory(size_t size);

 private:
  std::list<std::shared_ptr<uint8_t>> low_size_list_;
  std::list<std::shared_ptr<uint8_t>> hight_size_list_;
};