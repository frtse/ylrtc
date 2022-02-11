#include "stun_common.h"

#include "byte_buffer.h"
#include "stun_message.h"
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

std::optional<std::string> FastGetLocalUfrag(uint8_t* data, size_t size) {
  ByteReader reader(data, size);
  if (!reader.Consume(20))
    return std::nullopt;
  while (reader.Left() > 0) {
    uint16_t attr_type, attr_length;
    if (!reader.ReadUInt16(&attr_type))
      return std::nullopt;
    if (!reader.ReadUInt16(&attr_length))
      return std::nullopt;
    if (attr_type == StunMessage::Attribute::kAttrUsername) {
      std::string user_name((char*)reader.CurrentData(), attr_length);
      auto result = StringSplit(user_name, ":");
      if (result.size() != 2)
        return std::nullopt;
      return result[0];
    }
    if ((attr_length % 4) != 0) {
      attr_length += (4 - (attr_length % 4));
    }
    if (!reader.Consume(attr_length)) {
      return std::nullopt;
    }
  }

  return std::nullopt;
}