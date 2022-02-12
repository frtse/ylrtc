#pragma once

#include <atomic>
#include <cstddef>
#include <memory>
#include <string>
#include <optional>

#include "dtls_transport.h"
#include "ice_lite.h"
#include "sdp_negotiator.h"
#include "srtp_session.h"
#include "threads.h"
#include "udp_socket.h"
#include "rtcp_packet.h"

class WebrtcStream : public std::enable_shared_from_this<WebrtcStream>,
                     public UdpSocket::Observer,
                     public IceLite::Observer,
                     public DtlsTransport::Observer {
 public:
  class Observer {
   public:
    virtual void OnWebrtcStreamConnected(const std::string& stream_id) = 0;
    virtual void OnWebrtcStreamShutdown(const std::string& stream_id) = 0;
  };
  WebrtcStream(const std::string& room_id, const std::string& stream_id, std::shared_ptr<Observer> observer);
  ~WebrtcStream();

  const std::string& GetStreamId() const;
  virtual bool SetRemoteDescription(const std::string& offser) = 0;
  virtual std::optional<std::string> CreateAnswer() = 0;
  virtual void SetLocalDescription() = 0;
  const SdpNegotiator& GetSdpNegotiator() const;

  bool Start();
  void Stop();
  void ReceiveDataFromProxy(uint8_t* data, size_t size, udp::endpoint* ep);
  bool Connected() const;

 protected:
  void SendRtp(uint8_t* data, size_t size);
  void SendRtcp(RtcpPacket& rtcp_packet);
  virtual void OnRtpPacketReceive(uint8_t* data, size_t length) = 0;
  virtual void OnRtcpPacketReceive(uint8_t* data, size_t length) = 0;

  void OnUdpSocketDataReceive(uint8_t* data, size_t len, udp::endpoint* remote_ep) override;
  void OnUdpSocketError() override;
  void OnStunMessageSend(uint8_t* data, size_t size, udp::endpoint* ep) override;
  void OnIceConnectionCompleted() override;
  void OnIceConnectionError() override;
  void OnDtlsTransportSetup(SrtpSession::CipherSuite suite,
                            uint8_t* localMasterKey,
                            int localMasterKeySize,
                            uint8_t* remoteMasterKey,
                            int remoteMasterKeySize) override;
  void OnDtlsTransportError() override;
  void OnDtlsTransportShutdown() override;
  void OnDtlsTransportSendData(const uint8_t* data, size_t len) override;
  void Shutdown();

  std::unique_ptr<SrtpSession> send_srtp_session_;
  std::unique_ptr<SrtpSession> recv_srtp_session_;
  std::shared_ptr<UdpSocket> udp_socket_;
  std::unique_ptr<IceLite> ice_lite_;
  std::shared_ptr<DtlsTransport> dtls_transport_;
  udp::endpoint selected_endpoint_;
  char protect_buffer_[65536];
  std::atomic<bool> connection_established_;
  bool dtls_ready_{false};
  std::shared_ptr<WorkerThread> work_thread_;
  SdpNegotiator sdp_;
  std::string stream_id_;
  std::string room_id_;
  std::atomic<bool> stoped_{false};
  std::shared_ptr<Observer> observer_;
};