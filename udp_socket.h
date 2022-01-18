#pragma once

#include <boost/asio.hpp>
#include <cstdint>
#include <cstddef>
#include <memory>
#include <queue>
#include <string_view>

#include "utils.h"

class UdpSocket : public std::enable_shared_from_this<UdpSocket> {
 public:
  static constexpr uint32_t kDefaultInitReceiveBufferSize = 5000;
  class Observer {
   public:
    virtual ~Observer() = default;
    virtual void OnUdpSocketDataReceive(uint8_t* data, size_t len, udp::endpoint* remote_ep) = 0;
    virtual void OnUdpSocketError() = 0;
  };

  struct UdpMessage {
    std::shared_ptr<uint8_t> buffer;
    size_t length;
    udp::endpoint endpoint;
  };

  UdpSocket(boost::asio::io_context& io_context, std::weak_ptr<Observer> listener, size_t init_receive_buffer_size = kDefaultInitReceiveBufferSize);
  UdpSocket& operator=(const UdpSocket&) = delete;
  UdpSocket(const UdpSocket&) = delete;
  ~UdpSocket();

  bool Listen(std::string_view ip, uint16_t port);
  bool ListenSpecificEndpoint(std::string_view ip, uint16_t port, udp::endpoint* endpoint);
  void SendData(const uint8_t*, size_t len, udp::endpoint* endpoint);
  void SendData(const UdpMessage& message);
  unsigned short GetListeningPort();
  void Close();

 private:
  void DoSend();
  void StartReceive();
  void HandSend(const boost::system::error_code& ec, size_t bytes);
  void HandleReceive(const boost::system::error_code&, size_t bytes);
  void HandleConnected(const boost::system::error_code& error);
  size_t init_receive_buffer_size_;
  std::unique_ptr<udp::socket> socket_;
  udp::endpoint remote_endpoint_;
  bool closed_;
  std::weak_ptr<Observer> listener_;
  UdpMessage receive_data_;
  std::queue<UdpMessage> send_queue_;
  boost::asio::io_context& io_context_;
  uint16_t max_port_;
  uint16_t min_port_;
};