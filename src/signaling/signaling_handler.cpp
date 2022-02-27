#include "signaling_handler.h"

#include <exception>
#include <sstream>

#include "publish_stream.h"
#include "room.h"
#include "room_manager.h"
#include "signaling_server.h"
#include "signaling_server_base.h"
#include "spdlog/spdlog.h"
#include "subscribe_stream.h"
#include "yl_error.h"

SignalingHandler::SignalingHandler(SessionInfo& session_info) : session_info_{session_info} {}

std::string SignalingHandler::HandleSignaling(const std::string& signaling) {
  nlohmann::json response_json;
  try {
    auto request_json = nlohmann::json::parse(signaling);
    const std::string& action = request_json.at("action");
    if (request_json.find("transactionId") != request_json.end())
      response_json["transactionId"] = request_json.at("transactionId");
    YlError result = kOk;
    if (action == "subscribe") {
      const std::string& stream_id = request_json.at("streamId");
      const std::string& offer_sdp = request_json.at("offer");
      const std::string participant_id = request_json.at("participantId");
      auto room = RoomManager::GetInstance().GetRoomById(session_info_.room_id);
      if (room) {
        auto subscribe_stream = room->ParticipantSubscribe(session_info_.participant_id, participant_id, stream_id, offer_sdp);
        if (subscribe_stream) {
          response_json["streamId"] = subscribe_stream->GetStreamId();
          auto answer = subscribe_stream->CreateAnswer();
          if (answer) {
            response_json["answer"] = *answer;
            subscribe_stream->SetLocalDescription();
          } else {
            result = kSubscriptionFailed;
          }
        } else {
          result = kSubscriptionFailed;
        }
      } else {
        result = kNoRoomWithCorrespondingID;
      }
    } else if (action == "publish") {
      auto room = RoomManager::GetInstance().GetRoomById(session_info_.room_id);
      if (room) {
        auto publish_stream = room->ParticipantPublish(session_info_.participant_id, request_json.at("offer"));
        if (publish_stream) {
          response_json["streamId"] = publish_stream->GetStreamId();
          auto answer = publish_stream->CreateAnswer();
          if (answer) {
            response_json["answer"] = *answer;
            publish_stream->SetLocalDescription();
          } else {
            result = kPublishFailed;
          }
        } else {
          result = kPublishFailed;
        }
      } else {
        result = kNoRoomWithCorrespondingID;
      }
    } else if (action == "join") {
      const std::string& room_id = request_json.at("roomId");
      const std::string& participant_id = request_json.at("participantId");
      auto room = RoomManager::GetInstance().GetRoomById(room_id);
      if (room) {
        YlError result = room->Join(participant_id);
        if (result == kOk || result == kParticipantAlreadyJoined) {
          result = kOk;
          room_info_when_joining_ = room->GetRoomInfo();
          response_json["roomInfo"] = room_info_when_joining_;
          session_info_.room_id = room_id;
          session_info_.participant_id = participant_id;
        } else {
          result = kFailedToJoinRoom;
        }
      } else {
        result = kNoRoomWithCorrespondingID;
      }
    } else if (action == "publish_muteOrUnmute") {
      const std::string& publish_stream_id = request_json.at("streamId");
      bool muted = request_json.at("muted");
      const std::string& type = request_json.at("type");
      auto room = RoomManager::GetInstance().GetRoomById(session_info_.room_id);
      if (room) {
        auto publish_stream = std::dynamic_pointer_cast<PublishStream>(room->GetStreamById(publish_stream_id));
        if (publish_stream) {
          publish_stream->UpdateMuteInfo(type, muted);
          auto notification = Notification::MakePublishMuteOrUnmuteNotification(session_info_.room_id, muted, type, publish_stream_id);
          SignalingServer::GetInstance().Notify(notification);
        } else {
          result = kNoStreamWithCorrespondingIdFound;
        }
      } else {
        result = kNoRoomWithCorrespondingID;
      }
    } else if (action == "keepAlive") {
      // TODO.
    } else if (action == "ChangeSimulcastLayer") {
      const std::string& subscribe_stream_id = request_json.at("subscribeStreamId");
      const std::string& simulcast_layer = request_json.at("simulcastLayer");
      auto room = RoomManager::GetInstance().GetRoomById(session_info_.room_id);
      if (room) {
        auto subscribe_stream = std::dynamic_pointer_cast<SubscribeStream>(room->GetStreamById(subscribe_stream_id));
        if (subscribe_stream) {
          subscribe_stream->SetSimulcastLayer(simulcast_layer);
        } else {
          result = kNoStreamWithCorrespondingIdFound;
        }
      } else {
        result = kNoRoomWithCorrespondingID;
      }
    } else {
      result = kUnsupportedActions;
    }
    response_json["error"] = (result != kOk);
    response_json["detail"] = YlErrorToString(result);
  } catch (const std::exception& e) {
    response_json["error"] = true;
    std::stringstream ss;
    ss << "Bad request. Reason: " << e.what() << ".";
    response_json["detail"] = ss.str();
    spdlog::error("Handle signaling failed, signaling: {}, exception: {}", signaling, e.what());
  }
  return response_json.dump();
}

bool SignalingHandler::HijackNotification(const Notification& notification) {
  const nlohmann::json& context = notification.GetNotifyContext();
  try {
    if (context.at("type") != "streamAdded")
      return false;
    // Prevents duplicated streams returned by join rooms and added streams.
    std::string publish_stream_id = context.at("data").at("publishStreamId");
    auto& streams = room_info_when_joining_.at("streams");
    for (auto& stream : streams) {
      if (publish_stream_id == stream.at("publishStreamId"))
        return true;
    }
    return false;
  } catch (...) {
    return false;
  }
}