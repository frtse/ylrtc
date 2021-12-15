#pragma once

#include <string>

class websocket_session_base;
struct SessionInfo;
class SignalingHandler {
 public:
  SignalingHandler(SessionInfo& session_info);

  std::string HandleSignaling(const std::string& signaling);

 private:
  SessionInfo& session_info_;
};