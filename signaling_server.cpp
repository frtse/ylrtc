#include "signaling_server.h"

#include "spdlog/spdlog.h"
#include "threads.h"

SignalingServer::SignalingServer() : ioc_{MainThread::GetInstance().MessageLoop()}, acceptor_{ioc_} {}

bool SignalingServer::Start(std::string_view ip, uint16_t port) {
  boost::system::error_code ec;
  auto const address = net::ip::make_address(ip.data());
  auto endpoint = tcp::endpoint{address, port};

  acceptor_.open(endpoint.protocol(), ec);
  if (ec) {
    spdlog::error("Acceptor open failed. err = {}", ec.message());
    return false;
  }

  acceptor_.set_option(net::socket_base::reuse_address(true), ec);
  if (ec) {
    spdlog::error("Acceptor set opion [reuse_address] failed. err = {}", ec.message());
    return false;
  }

  acceptor_.bind(endpoint, ec);
  if (ec) {
    spdlog::error("Acceptor bind failed. err = {}", ec.message());
    return false;
  }

  acceptor_.listen(net::socket_base::max_listen_connections, ec);
  if (ec) {
    spdlog::error("Acceptor listen failed. err = {}", ec.message());
    return false;
  }

  DoAccept();
  return true;
}

void SignalingServer::Close() {
  boost::system::error_code err;
  acceptor_.cancel();
  acceptor_.close(err);
  closed_ = true;
  for (auto& session : sessions_)
    session->Close();
  sessions_.clear();
}

void SignalingServer::DoAccept() {
  if (closed_)
    return;
  acceptor_.async_accept(std::bind(&SignalingServer::OnAccept, this, std::placeholders::_1, std::placeholders::_2));
}

void SignalingServer::OnAccept(boost::system::error_code ec, tcp::socket socket) {
  if (closed_)
    return;
  if (ec) {
    spdlog::error("Signaling server accept failed. ec = {}", ec.message());
  } else {
    auto session = std::make_shared<SignalingSession>(std::move(socket), ssl_ctx_, this);
    sessions_.insert(session);
    session->Run();
  }

  DoAccept();
}

bool SignalingServer::LoadCertKeyFile(std::string_view cert, std::string_view key) {
  try {
    ssl_ctx_.use_certificate_chain_file(cert.data());
    ssl_ctx_.use_private_key_file(key.data(), ssl::context::file_format::pem);
  } catch (...) {
    return false;
  }

  return true;
}

void SignalingServer::OnSessionClose(std::shared_ptr<SignalingSession> session) {
  sessions_.erase(session);
}

SignalingServer& SignalingServer::GetInstance() {
  static SignalingServer instance;
  return instance;
}

void SignalingServer::Notify(const Notification& notification) {
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
