#pragma once

#include <string>
#include <vector>

#include "sdp.h"
#include "sdptransform/json.hpp"

class Notification {
 public:
  static const std::string kNotifyAllParticipants;

  static Notification MakeStreamAddedNotification(const std::string& notify_room_id,
                                                  const std::string& participant_id,
                                                  const std::string& publish_stream_id,
                                                  const Sdp& sdp);
  static Notification MakeStreamRemovedNotification(const std::string& notify_room_id,
                                                    const std::string& participant_id,
                                                    const std::string& publish_stream_id);
  static Notification MakePublishMuteOrUnmuteNotification(const std::string& notify_room_id,
                                                          bool muted,
                                                          const std::string& type,
                                                          const std::string& publish_stream_id);
  static Notification MakeParticipantJoinedNotification(const std::string& notify_room_id, const std::string& participant_id);
  static Notification MakeParticipantLeftNotification(const std::string& notify_room_id, const std::string& participant_id);

  const std::string& GetNotifyRoomId() const;
  const std::string& GetNotifyParticipantId() const;
  const nlohmann::json& GetNotifyContext() const;

 private:
  Notification(const std::string& notify_room_id, const std::string& notify_participant_id, const nlohmann::json& context);
  std::string notify_room_id_;
  std::string notify_participant_id_;
  nlohmann::json notify_context_;
};