#include "webrtc_stream_proxy.h"

#include "threads.h"
#include "server_config.h"
#include "stun_common.h"
#include "room_manager.h"
#include "spdlog/spdlog.h"

std::shared_ptr<WebrtcStreamProxy> WebrtcStreamProxy::GetInstance() {
  static std::shared_ptr<WebrtcStreamProxy> instance(new WebrtcStreamProxy);
  return instance;
}

bool WebrtcStreamProxy::Start() {
  udp_socket_.reset(new UdpSocket(MainThread::GetInstance().MessageLoop(), shared_from_this()));
  if (!udp_socket_->Listen(ServerConfig::GetInstance().LocalIp(), ServerConfig::GetInstance().WebRtcPort()))
    return false;
  return true;
}

void WebrtcStreamProxy::Stop() {
  MainThread::GetInstance().AssertInThisThread();
  if (udp_socket_)
    udp_socket_->Close();
}

WebrtcStreamProxy::WebrtcStreamProxy() = default;

void WebrtcStreamProxy::OnUdpSocketDataReceive(uint8_t* data, size_t len, udp::endpoint* remote_ep) {
  if (IsStun(data, len)) {
    auto result = FastGetLocalUfrag(data, len);
    if (result) {
      std::string room_id, stream_id;
      if (ExtractUfragInfo(*result, room_id, stream_id)) {
        auto room = RoomManager::GetInstance().GetRoomById(room_id);
        if (room) {
          auto stream = room->GetStreamById(stream_id);
          if (stream)
            stream->ReceiveDataFromProxy(data, len, remote_ep);
        }
      }
    }
  } else {
    spdlog::trace("Ignore receiving data that is not STUN.");
  }
}

void WebrtcStreamProxy::OnUdpSocketError() {

}