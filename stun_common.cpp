#include "stun_common.h"

#include "byte_buffer.h"
#include "utils.h"

bool IsStun(uint8_t* data, size_t size) {
  return (size >= 20) && (data[0] < 3) && (LoadUInt32BE(data + 4) == kStunMagicCookie);
}

std::string MakeUfrag(const std::string& room_id, const std::string& stream_id) {
  return room_id + "/" + stream_id;
}

bool ExtractUfragInfo(const std::string& ufrag, std::string& room_id, std::string& stream_id) {
  auto result = StringSplit(ufrag, "/");
  if (result.empty() || result.size() != 2)
    return false;
  room_id = result[0];
  stream_id = result[1];
  return true;
}
