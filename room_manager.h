#pragma once

#include <cstdint>
#include <string>
#include <memory>
#include <unordered_map>

class Room;
class RoomManager {
 public:
  static RoomManager& GetInstance();
  std::shared_ptr<Room> CreateRoom(const std::string& room_id);
  std::shared_ptr<Room> GetRoomById(const std::string& room_id);
  void DestroyRoom(const std::string& room_id);
  void Clear();

 private:
  RoomManager() = default;
  RoomManager(const RoomManager&) = delete;
  RoomManager& operator=(const RoomManager&) = delete;
  std::unordered_map<std::string, std::shared_ptr<Room>> id_room_map_;
};