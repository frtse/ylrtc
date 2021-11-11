#include "signaling_session.h"

#include "nlohmann/json.hpp"
#include "notification.h"
#include "room.h"
#include "room_manager.h"
#include "signaling_handler.h"
#include "signaling_server.h"
#include "spdlog/spdlog.h"

void SignalingSession::SendText(const std::string& text) {
  boost::beast::flat_buffer buffer;

  const auto n = boost::asio::buffer_copy(buffer.prepare(text.size()), boost::asio::buffer(text));
  buffer.commit(n);
  write_buffers_.push_back(std::move(buffer));

  if (write_buffers_.size() == 1)
    DoWrite();
}

void SignalingSession::DoWrite() {
  auto& buffer = write_buffers_.front();
  ws_.text(true);
  ws_.async_write(buffer.data(), beast::bind_front_handler(&SignalingSession::OnWrite, shared_from_this()));
}

// Take ownership of the stream
SignalingSession::SignalingSession(tcp::socket&& socket, ssl::context& ctx, Observer* observer)
    : ws_(std::move(socket), ctx), observer_{observer}, signaling_handler_{std::make_unique<SignalingHandler>(session_info_)} {}

// Start the asynchronous operation
void SignalingSession::Run() {
  net::dispatch(ws_.get_executor(), beast::bind_front_handler(&SignalingSession::OnRun, shared_from_this()));
}

void SignalingSession::OnRun() {
  // Set the timeout.
  beast::get_lowest_layer(ws_).expires_after(std::chrono::seconds(kSslTimeoutSeconds));

  // Perform the SSL handshake
  ws_.next_layer().async_handshake(ssl::stream_base::server, beast::bind_front_handler(&SignalingSession::OnHandshake, shared_from_this()));
}

void SignalingSession::OnHandshake(beast::error_code ec) {
  if (ec)
    return Fail(ec, "handshake");

  beast::get_lowest_layer(ws_).expires_never();
  ws_.set_option(websocket::stream_base::timeout::suggested(beast::role_type::server));

  ws_.set_option(websocket::stream_base::decorator([](websocket::response_type& res) { res.set(http::field::server, "Webrtc SFU"); }));
  ws_.async_accept(beast::bind_front_handler(&SignalingSession::OnAccept, shared_from_this()));
}

void SignalingSession::OnAccept(beast::error_code ec) {
  if (ec)
    return Fail(ec, "accept");
  DoRead();
}

void SignalingSession::DoRead() {
  ws_.async_read(read_buffer_, beast::bind_front_handler(&SignalingSession::OnRead, shared_from_this()));
}

void SignalingSession::OnRead(beast::error_code ec, std::size_t bytes_transferred) {
  boost::ignore_unused(bytes_transferred);

  if (ec == websocket::error::closed)
    return;

  if (ec)
    return Fail(ec, "read");

  if (!ws_.got_text())
    return;

  const auto signaling = boost::beast::buffers_to_string(read_buffer_.data());
  read_buffer_.consume(read_buffer_.size());
  SendText(signaling_handler_->HandleSignaling(signaling));
  DoRead();
}

void SignalingSession::OnWrite(beast::error_code ec, std::size_t bytes_transferred) {
  boost::ignore_unused(bytes_transferred);
  if (ec)
    return Fail(ec, "write");

  write_buffers_.erase(write_buffers_.begin());

  if (!write_buffers_.empty()) {
    DoWrite();
  }
}

void SignalingSession::Fail(beast::error_code ec, char const* what) {
  spdlog::warn("SignalingSession-- waht: {}, error message: {}", what, ec.message());

  if (ec != boost::asio::error::operation_aborted) {
    auto room = RoomManager::GetInstance().GetRoomById(session_info_.room_id);
    if (room)
      room->Leave(session_info_.participant_id);
    observer_->OnSessionClose(shared_from_this());
  }
}

SignalingSession::~SignalingSession() {
  spdlog::debug("call ~SignalingSession");
}

const SignalingSession::SessionInfo& SignalingSession::GetSessionInfo() const {
  return session_info_;
}