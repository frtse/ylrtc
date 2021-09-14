#include "room_manager.h"

#include "room.h"

RoomManager& RoomManager::GetInstance() {
  static RoomManager instance;
  return instance;
}

Room* RoomManager::CreateRoom(const std::string& room_id) {
  if (id_room_map_.find(room_id) != id_room_map_.end())
    return nullptr;
  auto new_room = new Room(room_id);
  id_room_map_[room_id] = new_room;
  return new_room;
}

Room* RoomManager::GetRoomById(const std::string& room_id) {
  auto result = id_room_map_.find(room_id);
  if (result == id_room_map_.end())
    return nullptr;
  return result->second;
}

void RoomManager::DestroyRoom(const std::string& room_id) {
  auto result = id_room_map_.find(room_id);
  if (result != id_room_map_.end()) {
    delete result->second;
    id_room_map_.erase(result);
  }
}

void RoomManager::Clear() {
  for (auto& i : id_room_map_) {
    delete i.second;
  }
  id_room_map_.clear();
}
