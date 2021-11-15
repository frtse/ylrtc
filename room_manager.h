#pragma once

#include <cstdint>
#include <string>
#include <unordered_map>

class Room;
class RoomManager {
 public:
  static RoomManager& GetInstance();
  Room* CreateRoom(const std::string& room_id);
  Room* GetRoomById(const std::string& room_id);
  void DestroyRoom(const std::string& room_id);
  void Clear();

 private:
  RoomManager() = default;
  RoomManager(const RoomManager&) = delete;
  RoomManager& operator=(const RoomManager&) = delete;
  std::unordered_map<std::string, Room*> id_room_map_;
};