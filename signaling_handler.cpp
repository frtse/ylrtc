#include "signaling_handler.h"

#include "notification.h"
#include "publish_stream.h"
#include "room.h"
#include "room_manager.h"
#include "sdptransform/json.hpp"
#include "signaling_server.h"
#include "spdlog/spdlog.h"
#include "subscribe_stream.h"

SignalingHandler::SignalingHandler(SignalingSession::SessionInfo& session_info)
    : session_info_{session_info} {}

std::optional<std::string> SignalingHandler::HandleSignaling(const std::string& signaling) {
  try {
    auto request_json = nlohmann::json::parse(signaling);
    nlohmann::json response_json;
    std::string action = request_json["action"];
    response_json["error"] = true;
    if (request_json.find("requestId") != request_json.end())
      response_json["requestId"] = request_json["requestId"];

    if (action == "subscribe") {
      // { action: "subscribe", streamId: streamId, offer: offer.sdp }
      std::string stream_id = request_json["streamId"];
      std::string offer_sdp = request_json["offer"];
      std::string participant_id = request_json["participantId"];
      spdlog::debug("subscribe, {} {} {}", session_info_.room_id, session_info_.participant_id,
                    stream_id);
      auto room = RoomManager::GetInstance().GetRoomById(session_info_.room_id);
      if (room) {
        auto subscribe_stream = room->ParticipantSubscribe(session_info_.participant_id,
                                                           participant_id, stream_id, offer_sdp);
        if (subscribe_stream) {
          response_json["error"] = false;
          response_json["streamId"] = subscribe_stream->GetStreamId();
          response_json["answer"] = subscribe_stream->CreateAnswer();
          subscribe_stream->SetLocalDescription();
        }
      }
    } else if (action == "publish") {
      spdlog::debug("publish, {} {}", session_info_.room_id, session_info_.participant_id);
      auto room = RoomManager::GetInstance().GetRoomById(session_info_.room_id);
      if (room) {
        auto publish_stream =
            room->ParticipantPublish(session_info_.participant_id, request_json["offer"]);

        if (publish_stream) {
          response_json["error"] = false;
          response_json["streamId"] = publish_stream->GetStreamId();
          response_json["answer"] = publish_stream->CreateAnswer();
        }
      }
    } else if (action == "join") {
      std::string room_id = request_json["roomId"];
      std::string participant_id = request_json["participantId"];
      auto room = RoomManager::GetInstance().GetRoomById(room_id);
      auto room_info = room->GetRoomInfo();
      if (room) {
        if (room->Join(participant_id)) {
          response_json["error"] = false;
          response_json["roomInfo"] = room_info;
          session_info_.room_id = room_id;
          session_info_.participant_id = participant_id;
        }
      }
    } else if (action == "publish_muteOrUnmute") {
      // { action: "publish_muteOrUnmute", streamId: this.streamId_, muted :
      // false, type: "audio"}
      std::string publish_stream_id = request_json["streamId"];
      bool muted = request_json["muted"];
      std::string type = request_json["type"];
      auto notification = Notification::MakePublishMuteOrUnmuteNotification(
          session_info_.room_id, muted, type, publish_stream_id);
      SignalingServer::GetInstance().Notify(notification);
    } else {
      response_json["error"] = true;
    }

    return response_json.dump();
  } catch (...) {
    spdlog::error("Handle signaling failed, signaling: {}", signaling);
    return std::nullopt;
  }
}