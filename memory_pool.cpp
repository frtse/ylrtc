#include "memory_pool.h"

thread_local MemoryPool memory_pool;

std::shared_ptr<uint8_t> MemoryPool::GetMemory(size_t size) {
  if (size <= kSizeThresholdLow) {
    for (auto& m : low_size_list_) {
      if (m.use_count() == 1)
        return m;
    }
    std::shared_ptr<uint8_t> new_buffer(new uint8_t[kSizeThresholdLow], [](uint8_t* p) { delete[] p;});
    low_size_list_.push_back(new_buffer);
    return new_buffer;
  }
  else if (size <= kSizeThresholdHight) {
    for (auto& m : hight_size_list_) {
      if (m.use_count() == 1)
        return m;
    }
    std::shared_ptr<uint8_t> new_buffer(new uint8_t[kSizeThresholdHight], [](uint8_t* p) { delete[] p;});
    hight_size_list_.push_back(new_buffer);
    return new_buffer;
  }
  else {
    std::shared_ptr<uint8_t> new_buffer(new uint8_t[size], [](uint8_t* p) { delete[] p;});
    return new_buffer;
  }
}