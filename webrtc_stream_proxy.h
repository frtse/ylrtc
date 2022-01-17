#pragma once

#include <memory>

#include "udp_socket.h"

class WebrtcStreamProxy : public std::enable_shared_from_this<WebrtcStreamProxy>, public UdpSocket::Observer {
 public:
  static std::shared_ptr<WebrtcStreamProxy> GetInstance();
  bool Start();
  void Stop();

 private:
  WebrtcStreamProxy();
  void OnUdpSocketDataReceive(uint8_t* data, size_t len, udp::endpoint* remote_ep) override;
  void OnUdpSocketError() override;
  std::shared_ptr<UdpSocket> udp_socket_;
};