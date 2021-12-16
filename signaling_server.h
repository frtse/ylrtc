#pragma once

#include <cstddef>
#include <memory>
#include <string>
#include <string_view>

#include "notification.h"
#include "signaling_server_base.h"
#include "utils.h"

template <class Body, class Allocator, class Send>
void HandleRequest(http::request<Body, http::basic_fields<Allocator>>&& req, Send&& send) {
  // Returns a bad request response
  auto const bad_request = [&req](beast::string_view why) {
    http::response<http::string_body> res{http::status::bad_request, req.version()};
    res.set(http::field::server, BOOST_BEAST_VERSION_STRING);
    res.set(http::field::content_type, "text/html");
    res.keep_alive(req.keep_alive());
    res.body() = std::string(why);
    res.prepare_payload();
    return res;
  };

  // Returns a server error response
  auto const server_error = [&req](beast::string_view what) {
    http::response<http::string_body> res{http::status::internal_server_error, req.version()};
    res.set(http::field::server, BOOST_BEAST_VERSION_STRING);
    res.set(http::field::content_type, "text/html");
    res.keep_alive(req.keep_alive());
    res.body() = "An error occurred: '" + std::string(what) + "'";
    res.prepare_payload();
    return res;
  };

  // Make sure we can handle the method
  if (req.method() != http::verb::get && req.method() != http::verb::post && req.method() != http::verb::delete_)
    return send(bad_request("Unknown HTTP-method"));

  // Request path must be absolute and not contain "..".
  if (req.target().empty() || req.target()[0] != '/' || req.target().find("..") != beast::string_view::npos)
    return send(bad_request("Illegal request-target"));

  // TODO web api.
  // Handle an unknown error
  if (false)
    return send(server_error("error"));

  std::string res_body;
  auto const res_body_size = res_body.size();
  // Respond to request
  http::response<http::string_body> res{std::piecewise_construct, std::make_tuple(std::move(res_body)), std::make_tuple(http::status::ok, req.version())};
  res.set(http::field::server, BOOST_BEAST_VERSION_STRING);
  res.set(http::field::content_type, "application/json");
  res.content_length(res_body_size);
  res.keep_alive(req.keep_alive());
  return send(std::move(res));
}

// Handles a plain WebSocket connection
class PlainWebsocketSession : public WebsocketSession<PlainWebsocketSession> {
  websocket::stream<beast::tcp_stream> ws_;

 public:
  // Create the session
  explicit PlainWebsocketSession(beast::tcp_stream&& stream, std::shared_ptr<WebsocketSessionSet> websocket_sessions)
      : WebsocketSession<PlainWebsocketSession>{websocket_sessions}, ws_(std::move(stream)) {}

  ~PlainWebsocketSession() {}

  // Called by the base class
  websocket::stream<beast::tcp_stream>& Ws() {
    return ws_;
  }
};

// Handles an SSL WebSocket connection
class SslWebsocketSession : public WebsocketSession<SslWebsocketSession> {
  websocket::stream<beast::ssl_stream<beast::tcp_stream>> ws_;

 public:
  // Create the SslWebsocketSession
  explicit SslWebsocketSession(beast::ssl_stream<beast::tcp_stream>&& stream, std::shared_ptr<WebsocketSessionSet> websocket_sessions)
      : WebsocketSession<SslWebsocketSession>{websocket_sessions}, ws_(std::move(stream)) {}

  ~SslWebsocketSession() {}

  // Called by the base class
  websocket::stream<beast::ssl_stream<beast::tcp_stream>>& Ws() {
    return ws_;
  }
};

template <class Body, class Allocator>
void MakeWebsocketSession(beast::tcp_stream stream, http::request<Body, http::basic_fields<Allocator>> req, std::shared_ptr<WebsocketSessionSet> websocket_sessions) {
  std::make_shared<PlainWebsocketSession>(std::move(stream), websocket_sessions)->Run(std::move(req));
}

template <class Body, class Allocator>
void MakeWebsocketSession(beast::ssl_stream<beast::tcp_stream> stream, http::request<Body, http::basic_fields<Allocator>> req, std::shared_ptr<WebsocketSessionSet> websocket_sessions) {
  std::make_shared<SslWebsocketSession>(std::move(stream), websocket_sessions)->Run(std::move(req));
}

// Handles a plain HTTP connection
class PlainHttpSession : public HttpSession<PlainHttpSession>, public std::enable_shared_from_this<PlainHttpSession> {
  beast::tcp_stream stream_;

 public:
  // Create the session
  PlainHttpSession(beast::tcp_stream&& stream, beast::flat_buffer&& buffer, std::shared_ptr<WebsocketSessionSet> websocket_sessions);
  // Start the session
  void Run();

  // Called by the base class
  beast::tcp_stream& Stream();

  // Called by the base class
  beast::tcp_stream ReleaseStream();

  // Called by the base class
  void DoEof();
};

// Handles an SSL HTTP connection
class SslHttpSession : public HttpSession<SslHttpSession>, public std::enable_shared_from_this<SslHttpSession> {
  beast::ssl_stream<beast::tcp_stream> stream_;

 public:
  SslHttpSession(beast::tcp_stream&& stream, ssl::context& ctx, beast::flat_buffer&& buffer, std::shared_ptr<WebsocketSessionSet> websocket_sessions);

  // Start the session
  void Run();

  // Called by the base class
  beast::ssl_stream<beast::tcp_stream>& Stream();
  // Called by the base class
  beast::ssl_stream<beast::tcp_stream> ReleaseStream();
  // Called by the base class
  void DoEof();

 private:
  void OnHandshake(beast::error_code ec, std::size_t bytes_used);
  void OnShutdown(beast::error_code ec);
};

// Detects SSL handshakes
class DetectSession : public std::enable_shared_from_this<DetectSession> {
  beast::tcp_stream stream_;
  ssl::context& ctx_;
  beast::flat_buffer buffer_;
  std::shared_ptr<WebsocketSessionSet> websocket_sessions_;

 public:
  explicit DetectSession(tcp::socket&& socket, ssl::context& ctx, std::shared_ptr<WebsocketSessionSet> websocket_sessions);

  void Run();
  void OnDetect(beast::error_code ec, bool result);
};

// Accepts incoming connections and launches the sessions
class SignalingServer {
  net::io_context& ioc_;
  ssl::context ctx_{ssl::context::tlsv12};
  tcp::acceptor acceptor_;
  bool closed_{false};
  std::shared_ptr<WebsocketSessionSet> websocket_sessions_;

 public:
  static SignalingServer& GetInstance();
  bool Start(std::string_view ip, uint16_t port);
  void Close();
  bool LoadCertKeyFile(const std::string_view cert, const std::string_view key);
  void Notify(const Notification& notification);

 private:
  SignalingServer();
  void DoAccept();
  void OnAccept(beast::error_code ec, tcp::socket socket);
};