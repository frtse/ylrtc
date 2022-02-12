#pragma once

#include <string>
#include <vector>

#include "sdp_negotiator.h"
#include "sdptransform/json.hpp"

/**
 * @brief Notification information to participants.
 * 
 */
class Notification {
 public:
  // Means to notify all participants.
  static const std::string kNotifyAllParticipants;
  /**
   * @brief Webrtc stream added notification.
   * 
   */
  static Notification MakeStreamAddedNotification(const std::string& notify_room_id,
                                                  const std::string& participant_id,
                                                  const std::string& publish_stream_id,
                                                  const SdpNegotiator& sdp);
  
  /**
   * @brief Webrtc stream removed notification.
   * 
   */
  static Notification MakeStreamRemovedNotification(const std::string& notify_room_id,
                                                    const std::string& participant_id,
                                                    const std::string& publish_stream_id);
  
  /**
   * @brief Mute or unmute notification.
   * 
   */
  static Notification MakePublishMuteOrUnmuteNotification(const std::string& notify_room_id,
                                                          bool muted,
                                                          const std::string& type,
                                                          const std::string& publish_stream_id);
  /**
   * @brief Notice that some participants have joined the meeting.
   * 
   */
  static Notification MakeParticipantJoinedNotification(const std::string& notify_room_id, const std::string& participant_id);
  
  /**
   * @brief Notice that some participants have left the meeting.
   * 
   */
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