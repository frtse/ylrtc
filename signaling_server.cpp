#include "signaling_server.h"

#include "threads.h"

PlainHttpSession::PlainHttpSession(beast::tcp_stream&& stream, beast::flat_buffer&& buffer, std::shared_ptr<WebsocketSessionSet> websocket_sessions)
    : HttpSession<PlainHttpSession>(std::move(buffer), websocket_sessions), stream_(std::move(stream)) {}

// Start the session
void PlainHttpSession::Run() {
  this->DoRead();
}

// Called by the base class
beast::tcp_stream& PlainHttpSession::Stream() {
  return stream_;
}

// Called by the base class
beast::tcp_stream PlainHttpSession::ReleaseStream() {
  return std::move(stream_);
}

// Called by the base class
void PlainHttpSession::DoEof() {
  // Send a TCP shutdown
  beast::error_code ec;
  stream_.socket().shutdown(tcp::socket::shutdown_send, ec);

  // At this point the connection is closed gracefully
}

// Create the http_session
SslHttpSession::SslHttpSession(beast::tcp_stream&& stream, ssl::context& ctx, beast::flat_buffer&& buffer, std::shared_ptr<WebsocketSessionSet> websocket_sessions)
    : HttpSession<SslHttpSession>(std::move(buffer), websocket_sessions), stream_(std::move(stream), ctx) {}

// Start the session
void SslHttpSession::Run() {
  // Set the timeout.
  beast::get_lowest_layer(stream_).expires_after(std::chrono::seconds(30));

  // Perform the SSL handshake
  // Note, this is the buffered version of the handshake.
  stream_.async_handshake(ssl::stream_base::server, buffer_.data(), beast::bind_front_handler(&SslHttpSession::OnHandshake, shared_from_this()));
}

// Called by the base class
beast::ssl_stream<beast::tcp_stream>& SslHttpSession::Stream() {
  return stream_;
}

// Called by the base class
beast::ssl_stream<beast::tcp_stream> SslHttpSession::ReleaseStream() {
  return std::move(stream_);
}

// Called by the base class
void SslHttpSession::DoEof() {
  // Set the timeout.
  beast::get_lowest_layer(stream_).expires_after(std::chrono::seconds(30));

  // Perform the SSL shutdown
  stream_.async_shutdown(beast::bind_front_handler(&SslHttpSession::OnShutdown, shared_from_this()));
}

void SslHttpSession::OnHandshake(beast::error_code ec, std::size_t bytes_used) {
  if (ec)
    return HandleError(ec, "handshake");

  // Consume the portion of the buffer used by the handshake
  buffer_.consume(bytes_used);

  DoRead();
}

void SslHttpSession::OnShutdown(beast::error_code ec) {
  if (ec)
    return HandleError(ec, "shutdown");

  // At this point the connection is closed gracefully
}

DetectSession::DetectSession(tcp::socket&& socket, ssl::context& ctx, std::shared_ptr<WebsocketSessionSet> websocket_sessions)
    : stream_(std::move(socket)), ctx_(ctx), websocket_sessions_(websocket_sessions) {}

void DetectSession::Run() {
  // Set the timeout.
  stream_.expires_after(std::chrono::seconds(30));

  beast::async_detect_ssl(stream_, buffer_, beast::bind_front_handler(&DetectSession::OnDetect, this->shared_from_this()));
}

void DetectSession::OnDetect(beast::error_code ec, bool result) {
  if (ec)
    return HandleError(ec, "detect");

  if (result) {
    // Launch SSL session
    std::make_shared<SslHttpSession>(std::move(stream_), ctx_, std::move(buffer_), websocket_sessions_)->Run();
    return;
  }

  // Launch plain session
  std::make_shared<PlainHttpSession>(std::move(stream_), std::move(buffer_), websocket_sessions_)->Run();
}

SignalingServer::SignalingServer() : ioc_(MainThread::GetInstance().MessageLoop()), acceptor_(net::make_strand(ioc_)), websocket_sessions_{std::make_shared<WebsocketSessionSet>()} {}

SignalingServer& SignalingServer::GetInstance() {
  static SignalingServer instance;
  return instance;
}

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
  websocket_sessions_->Clear();
}

bool SignalingServer::LoadCertKeyFile(const std::string_view cert, const std::string_view key) {
  try {
    ctx_.use_certificate_chain_file(cert.data());
    ctx_.use_private_key_file(key.data(), ssl::context::file_format::pem);
  } catch (...) {
    return false;
  }

  return true;
}

void SignalingServer::Notify(const Notification& notification) {
  if (websocket_sessions_)
    websocket_sessions_->Notify(notification);
}

void SignalingServer::DoAccept() {
  if (closed_)
    return;
  acceptor_.async_accept(ioc_, beast::bind_front_handler(&SignalingServer::OnAccept, this));
}

void SignalingServer::OnAccept(beast::error_code ec, tcp::socket socket) {
  if (closed_)
    return;
  if (ec) {
    HandleError(ec, "accept");
  } else {
    std::make_shared<DetectSession>(std::move(socket), ctx_, websocket_sessions_)->Run();
  }

  DoAccept();
}
