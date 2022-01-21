#pragma once

#include <string>

#include "notification.h"
#include "sdptransform/json.hpp"

struct SessionInfo;
class SignalingHandler {
 public:
  SignalingHandler(SessionInfo& session_info);

  std::string HandleSignaling(const std::string& signaling);

  /**
   * @brief Hijack unwanted notifications.
   * 
   * @param notification 
   * @return true Notifications that should be discarded.
   * @return false Notifications that should not be discarded.
   */
  bool HijackNotification(const Notification& notification);

 private:
  SessionInfo& session_info_;
  nlohmann::json room_info_when_joining_;
};