#pragma once

#include <cstdint>
#include <cstddef>
#include <list>
#include <memory>

class MemoryPool {
 public:
  std::shared_ptr<uint8_t> AllocMemory(size_t size);

 private:
  static constexpr uint32_t kSizeThresholdHalfMTU = 750;
  static constexpr uint32_t kSizeThresholdMTU = 1500;
  std::list<std::shared_ptr<uint8_t>> low_size_list_;
  std::list<std::shared_ptr<uint8_t>> high_size_list_;
};