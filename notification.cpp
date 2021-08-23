#include "notification.h"

const std::string Notification::kNotifyAllParticipants = "";

Notification::Notification(const std::string& notify_room_id,
                           const std::string& notify_participant_id,
                           const nlohmann::json& context)
    : notify_room_id_{notify_room_id},
      notify_participant_id_{notify_participant_id},
      notify_context_{context} {}

const std::string& Notification::GetNotifyRoomId() const {
  return notify_room_id_;
}

const std::string& Notification::GetNotifyParticipantId() const {
  return notify_participant_id_;
}

const nlohmann::json& Notification::GetNotifyContext() const {
  return notify_context_;
}

Notification Notification::MakeStreamAddedNotification(const std::string& notify_room_id,
                                                       const std::string& participant_id,
                                                       const std::string& publish_stream_id,
                                                       const Sdp& sdp) {
  nlohmann::json context;
  context["type"] = "streamAdded";
  nlohmann::json data;
  data["participantId"] = participant_id;
  data["publishStreamId"] = publish_stream_id;
  data["hasVideo"] = sdp.HasVideo();
  data["hasAudio"] = sdp.HasAudio();
  context["data"] = data;
  return Notification(notify_room_id, kNotifyAllParticipants, context);
}

Notification Notification::MakeStreamRemovedNotification(const std::string& notify_room_id,
                                                         const std::string& participant_id,
                                                         const std::string& publish_stream_id) {
  nlohmann::json context;
  context["type"] = "streamRemoved";
  nlohmann::json data;
  data["publishParticipantId"] = participant_id;
  data["publishStreamId"] = publish_stream_id;
  context["data"] = data;
  return Notification(notify_room_id, kNotifyAllParticipants, context);
}

Notification Notification::MakePublishMuteOrUnmuteNotification(
    const std::string& notify_room_id,
    bool muted,
    const std::string& type,
    const std::string& publish_stream_id) {
  nlohmann::json context;
  context["type"] = "publishMuteOrUnmute";
  nlohmann::json data;
  data["publishStreamId"] = publish_stream_id;
  data["muted"] = muted;
  data["type"] = type;
  context["data"] = data;
  return Notification(notify_room_id, kNotifyAllParticipants, context);
}

Notification Notification::MakeParticipantJoinedNotification(const std::string& notify_room_id,
                                                             const std::string& participant_id) {
  nlohmann::json context;
  context["type"] = "participantJoined";
  nlohmann::json data;
  data["participantId"] = participant_id;
  context["data"] = data;
  return Notification(notify_room_id, kNotifyAllParticipants, context);
}

Notification Notification::MakeParticipantLeftNotification(const std::string& notify_room_id,
                                                           const std::string& participant_id) {
  nlohmann::json context;
  context["type"] = "participantLeft";
  nlohmann::json data;
  data["participantId"] = participant_id;
  context["data"] = data;
  return Notification(notify_room_id, kNotifyAllParticipants, context);
}
