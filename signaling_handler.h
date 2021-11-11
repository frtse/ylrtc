#pragma once

#include <string>

#include "signaling_session.h"

class SignalingHandler {
 public:
  SignalingHandler(SignalingSession::SessionInfo& session_info);

  std::string HandleSignaling(const std::string& signaling);

 private:
  SignalingSession::SessionInfo& session_info_;
};