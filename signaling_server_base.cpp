#include "signaling_server_base.h"

#include "spdlog/spdlog.h"

void HandleError(beast::error_code ec, char const* what) {
  // ssl::error::stream_truncated, also known as an SSL "short read",
  // indicates the peer closed the connection without performing the
  // required closing handshake (for example, Google does this to
  // improve performance). Generally this can be a security issue,
  // but if your communication protocol is self-terminated (as
  // it is with both HTTP and WebSocket) then you may simply
  // ignore the lack of close_notify.
  //
  // https://github.com/boostorg/beast/issues/38
  //
  // https://security.stackexchange.com/questions/91435/how-to-handle-a-malicious-ssl-tls-shutdown
  //
  // When a short read would cut off the end of an HTTP message,
  // Beast returns the error beast::http::error::partial_message.
  // Therefore, if we see a short read here, it has occurred
  // after the message has been completed, so it is safe to ignore it.

  if (ec == net::ssl::error::stream_truncated)
    return;

  spdlog::warn("{}: {}", what, ec.message());
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
        session->SendText(notification.GetNotifyContext().dump());
      else if (session->GetSessionInfo().participant_id == notification.GetNotifyParticipantId())
        session->SendText(notification.GetNotifyContext().dump());
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
