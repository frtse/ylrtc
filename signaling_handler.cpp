#include "signaling_handler.h"

#include <exception>
#include <sstream>
#include "notification.h"
#include "publish_stream.h"
#include "room.h"
#include "room_manager.h"
#include "sdptransform/json.hpp"
#include "signaling_server.h"
#include "spdlog/spdlog.h"
#include "subscribe_stream.h"
#include "signaling_server_base.h"

SignalingHandler::SignalingHandler(SessionInfo& session_info) : session_info_{session_info} {}

std::string SignalingHandler::HandleSignaling(const std::string& signaling) {
  nlohmann::json response_json;
  try {
    auto request_json = nlohmann::json::parse(signaling);
    const std::string& action = request_json.at("action");
    if (request_json.find("transactionId") != request_json.end())
      response_json["transactionId"] = request_json.at("transactionId");

    if (action == "subscribe") {
      // { action: "subscribe", streamId: streamId, offer: offer.sdp }
      const std::string& stream_id = request_json.at("streamId");
      const std::string& offer_sdp = request_json.at("offer");
      const std::string participant_id = request_json.at("participantId");
      auto room = RoomManager::GetInstance().GetRoomById(session_info_.room_id);
      if (room) {
        auto subscribe_stream = room->ParticipantSubscribe(session_info_.participant_id, participant_id, stream_id, offer_sdp);
        if (subscribe_stream) {
          response_json["error"] = false;
          response_json["streamId"] = subscribe_stream->GetStreamId();
          response_json["answer"] = subscribe_stream->CreateAnswer();
          response_json["detail"] = "Succeed.";
          subscribe_stream->SetLocalDescription();
        }
        else {
          response_json["error"] = true;
          response_json["detail"] = "Subscription failed.";
        }
      }
      else {
        response_json["error"] = true;
        response_json["detail"] = "No room found.";
      }
    } else if (action == "publish") {
      auto room = RoomManager::GetInstance().GetRoomById(session_info_.room_id);
      if (room) {
        auto publish_stream = room->ParticipantPublish(session_info_.participant_id, request_json["offer"]);
        if (publish_stream) {
          response_json["error"] = false;
          response_json["streamId"] = publish_stream->GetStreamId();
          response_json["answer"] = publish_stream->CreateAnswer();
          response_json["detail"] = "Succeed.";
          publish_stream->SetLocalDescription();
        }
        else {
          response_json["error"] = true;
          response_json["detail"] = "Publish failed.";
        }
      }
      else {
        response_json["error"] = true;
        response_json["detail"] = "No room found.";
      }
    } else if (action == "join") {
      const std::string& room_id = request_json.at("roomId");
      const std::string& participant_id = request_json.at("participantId");
      auto room = RoomManager::GetInstance().GetRoomById(room_id);
      if (room) {
        if (room->Join(participant_id)) {
          response_json["error"] = false;
          response_json["roomInfo"] = room->GetRoomInfo();
          response_json["detail"] = "Succeed.";
          session_info_.room_id = room_id;
          session_info_.participant_id = participant_id;
        }
        else {
          response_json["error"] = true;
          response_json["detail"] = "Failed to join the room.";
        }
      }
      else {
        response_json["error"] = true;
        response_json["detail"] = "No room found.";
      }
    } else if (action == "publish_muteOrUnmute") {
      // { action: "publish_muteOrUnmute", streamId: this.streamId_, muted :
      // false, type: "audio"}
      const std::string& publish_stream_id = request_json.at("streamId");
      bool muted = request_json["muted"];
      const std::string& type = request_json.at("type");
      auto room = RoomManager::GetInstance().GetRoomById(session_info_.room_id);
      if (room) {
        auto publish_stream = room->GetPublishStreamById(publish_stream_id);
        if (publish_stream) {
          publish_stream->UpdateMuteInfo(type, muted);
          auto notification = Notification::MakePublishMuteOrUnmuteNotification(session_info_.room_id, muted, type, publish_stream_id);
          SignalingServer::GetInstance().Notify(notification);
          response_json["detail"] = "Succeed.";
          response_json["error"] = false;
        }
        else {
          response_json["error"] = true;
        }
      }
      else {
        response_json["error"] = true;
      }
    }
    else if (action == "keepAlive") {
      response_json["error"] = true;
    }
    else {
      response_json["detail"] = "Unsupported actions.";
      response_json["error"] = true;
    }
  } catch (const std::exception& e) {
    response_json["error"] = true;
    std::stringstream ss;
    ss << "Bad request. Reason: " << e.what() << ".";
    response_json["detail"] = ss.str();
    spdlog::error("Handle signaling failed, signaling: {}, exception: {}", signaling, e.what());
  }
  return response_json.dump();
}