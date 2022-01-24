#include "signaling_server_base.h"

#include "room_manager.h"
#include "spdlog/spdlog.h"

void HandleError(beast::error_code ec, char const* what) {
  spdlog::warn("{}: {}", what, ec.message());
}

void WebsocketSessionBase::HandleWsError(beast::error_code ec, char const* what) {
  auto room = RoomManager::GetInstance().GetRoomById(session_info_.room_id);
  if (room)
    room->Leave(session_info_.participant_id);
}

WebsocketSessionBase::WebsocketSessionBase() : signaling_handler_{std::make_unique<SignalingHandler>(session_info_)} {}

WebsocketSessionBase::~WebsocketSessionBase() {}

const SessionInfo& WebsocketSessionBase::GetSessionInfo() const {
  return session_info_;
}

WebsocketSessionSet::WebsocketSessionSet() {}

void WebsocketSessionSet::Join(WebsocketSessionBase* session) {
  sessions_.insert(session);
}

void WebsocketSessionSet::Leave(WebsocketSessionBase* session) {
  sessions_.erase(session);
}

void WebsocketSessionSet::Notify(const Notification& notification) {
  for (auto session : sessions_) {
    if (session->GetSessionInfo().room_id == notification.GetNotifyRoomId()) {
      if (notification.GetNotifyParticipantId() == Notification::kNotifyAllParticipants)
        session->SendNotification(notification);
      else if (session->GetSessionInfo().participant_id == notification.GetNotifyParticipantId())
        session->SendNotification(notification);
      else
        spdlog::error("Unrecognized notification.");
    }
  }
}

void WebsocketSessionSet::Clear() {
  for (auto session : sessions_) {
    session->Close();
  }
  sessions_.clear();
}