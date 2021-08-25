#pragma once

#include <cstdint>
#include <memory>

class PublishStreamTrack {
 public:
  struct Configuration {
    uint32_t ssrc;
    uint8_t payload_type;
    uint32_t rtx_ssrc{0};
    uint8_t rtx_payload_type{0};
    bool rtx_enabled{false};
    bool nack_enabled{false};
  };

  PublishStreamTrack(const Configuration& configuration);

 private:
  Configuration configuration_;
};