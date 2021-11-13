#pragma once

#include <cstdint>
#include <memory>
#include <unordered_set>
#include <string_view>
#include <boost/asio.hpp>

#include "notification.h"
#include "signaling_session.h"

namespace net = boost::asio;
using tcp = boost::asio::ip::tcp;
namespace ssl = boost::asio::ssl;

class SignalingServer : public SignalingSession::Observer {
 public:
  static SignalingServer& GetInstance();
  bool LoadCertKeyFile(std::string_view cert, std::string_view key);
  bool Start(std::string_view ip, uint16_t port);
  void Notify(const Notification& notification);

 private:
  SignalingServer();
  void DoAccept();
  void OnAccept(boost::system::error_code ec, tcp::socket socket);
  void OnSessionClose(std::shared_ptr<SignalingSession> session) override;

  net::io_context& ioc_;
  tcp::acceptor acceptor_;
  ssl::context ssl_ctx_{ssl::context::tlsv12};
  std::unordered_set<std::shared_ptr<SignalingSession>> sessions_;
};