#pragma once

#include <boost/asio.hpp>
#include <boost/bind/bind.hpp>
#include <cstddef>
#include <memory>
#include <queue>
#include <string_view>
#include <thread>

using udp = boost::asio::ip::udp;

class UdpSocket : public std::enable_shared_from_this<UdpSocket> {
 public:
  class Observer {
   public:
    virtual ~Observer() = default;
    virtual void OnUdpSocketDataReceive(uint8_t* data, size_t len, udp::endpoint* remote_ep) = 0;
    virtual void OnUdpSocketError() = 0;
  };

  struct UdpMessage {
    std::unique_ptr<uint8_t[]> buffer;
    size_t length;
    udp::endpoint endpoint;
  };

  UdpSocket(boost::asio::io_context& io_context, Observer* listener, size_t init_receive_buffer_size);
  UdpSocket& operator=(const UdpSocket&) = delete;
  UdpSocket(const UdpSocket&) = delete;
  ~UdpSocket();

  void SetMinMaxPort(uint16_t min, uint16_t max);
  bool Listen(std::string_view ip);
  void SendData(const uint8_t*, size_t len, udp::endpoint* endpoint);
  void SendData(UdpMessage&& message);
  unsigned short GetListeningPort();
  void Close();

 private:
  void DoSend();
  void StartReceive();
  void HandSend(const boost::system::error_code& ec, size_t bytes);
  void HandleReceive(const boost::system::error_code&, size_t bytes);
  size_t init_receive_buffer_size_;
  std::unique_ptr<udp::socket> socket_;
  udp::endpoint remote_endpoint_;
  bool is_closing_;
  Observer* listener_;
  UdpMessage receive_data_;
  std::queue<UdpMessage> send_queue_;
  boost::asio::io_context& io_context_;
  uint16_t max_port_;
  uint16_t min_port_;
};