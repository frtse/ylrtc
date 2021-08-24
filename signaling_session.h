#pragma once

#include <boost/asio.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/ssl.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/beast/websocket/ssl.hpp>
#include <cstdint>
#include <memory>
#include <string>

#include "sdptransform/json.hpp"

namespace beast = boost::beast;
namespace http = beast::http;
namespace websocket = beast::websocket;
namespace net = boost::asio;
namespace ssl = boost::asio::ssl;
using tcp = boost::asio::ip::tcp;

class SignalingHandler;
class SignalingSession : public std::enable_shared_from_this<SignalingSession> {
 public:
  class Observer {
   public:
    virtual void OnSessionClose(std::shared_ptr<SignalingSession> session) = 0;
  };

  struct SessionInfo {
    std::string room_id;
    std::string participant_id;
  };

  // Take ownership of the stream.
  SignalingSession(tcp::socket&& socket, ssl::context& ctx, Observer* observer);
  ~SignalingSession();

  // Start the asynchronous operation.
  void Run();

  void SendText(const std::string& text);
  const SessionInfo& GetSessionInfo() const;

 private:
  websocket::stream<beast::ssl_stream<beast::tcp_stream>> ws_;
  std::vector<beast::flat_buffer> write_buffers_;
  boost::beast::multi_buffer read_buffer_;

  void DoRead();
  void OnRun();
  void OnRead(beast::error_code ec, std::size_t bytes_transferred);
  void DoWrite();
  void OnWrite(beast::error_code ec, std::size_t bytes_transferred);
  void OnHandshake(beast::error_code ec);
  void OnAccept(beast::error_code ec);
  void Fail(beast::error_code ec, char const* what);
  SessionInfo session_info_;
  std::unique_ptr<SignalingHandler> signaling_handler_;
  Observer* observer_;
};