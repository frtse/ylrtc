#include "memory_pool.h"

#include "server_config.h"

thread_local MemoryPool memory_pool;

std::shared_ptr<uint8_t> MemoryPool::AllocMemory(size_t size) {
  if (!ServerConfig::GetInstance().MemoryPoolEnabled()) {
    std::shared_ptr<uint8_t> buffer(new uint8_t[size], [](uint8_t* p) { delete[] p; });
    return buffer;
  }
  if (size <= kSizeThresholdHalfMTU) {
    for (auto& m : low_size_list_) {
      if (m.use_count() == 1)
        return m;
    }
    std::shared_ptr<uint8_t> new_buffer(new uint8_t[kSizeThresholdHalfMTU], [](uint8_t* p) { delete[] p; });
    if (low_size_list_.size() < ServerConfig::GetInstance().MemoryPoolMaxListLength())
      low_size_list_.push_back(new_buffer);
    return new_buffer;
  } else if (size <= kSizeThresholdMTU) {
    for (auto& m : high_size_list_) {
      if (m.use_count() == 1)
        return m;
    }
    std::shared_ptr<uint8_t> new_buffer(new uint8_t[kSizeThresholdMTU], [](uint8_t* p) { delete[] p; });
    if (high_size_list_.size() < ServerConfig::GetInstance().MemoryPoolMaxListLength())
      high_size_list_.push_back(new_buffer);
    return new_buffer;
  } else {
    std::shared_ptr<uint8_t> new_buffer(new uint8_t[size], [](uint8_t* p) { delete[] p; });
    return new_buffer;
  }
}