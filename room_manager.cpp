#include "room_manager.h"

#include "room.h"

RoomManager& RoomManager::GetInstance() {
  static RoomManager instance;
  return instance;
}

std::shared_ptr<Room> RoomManager::CreateRoom(const std::string& room_id) {
  if (id_room_map_.find(room_id) != id_room_map_.end())
    return nullptr;
  auto new_room = std::make_shared<Room>(room_id);
  id_room_map_[room_id] = new_room;
  return new_room;
}

std::shared_ptr<Room> RoomManager::GetRoomById(const std::string& room_id) {
  auto result = id_room_map_.find(room_id);
  if (result == id_room_map_.end())
    return nullptr;
  return result->second;
}

std::vector<std::string> RoomManager::GetAllRoomId() const {
  std::vector<std::string> room_id_array;
  for (auto& e : id_room_map_)
    room_id_array.push_back(e.first);
  return room_id_array;
}

void RoomManager::DestroyRoom(const std::string& room_id) {
  auto result = id_room_map_.find(room_id);
  if (result != id_room_map_.end()) {
    id_room_map_.erase(result);
  }
}

void RoomManager::Clear() {
  for (auto& p : id_room_map_)
    p.second->Destroy();
  id_room_map_.clear();
}
