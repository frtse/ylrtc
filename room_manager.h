#pragma once

#include <cstdint>
#include <string>
#include <memory>
#include <unordered_map>
#include <vector>

#include "room.h"
#include "yl_error.h"

class RoomManager {
 public:
  static RoomManager& GetInstance();
  YlError CreateRoom(const std::string& room_id);
  std::shared_ptr<Room> GetRoomById(const std::string& room_id);
  std::vector<std::string> GetAllRoomId() const;
  void DestroyRoom(const std::string& room_id);
  void Clear();

 private:
  RoomManager() = default;
  RoomManager(const RoomManager&) = delete;
  RoomManager& operator=(const RoomManager&) = delete;
  std::unordered_map<std::string, std::shared_ptr<Room>> id_room_map_;
};