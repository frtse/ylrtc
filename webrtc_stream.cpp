#include "webrtc_stream.h"

#include "dtls_context.h"
#include "rtp_utils.h"
#include "server_config.h"
#include "utils.h"
#include "stun_message.h"
#include "rtcp_packet.h"
#include "spdlog/spdlog.h"

WebrtcStream::WebrtcStream(const std::string& stream_id, std::shared_ptr<Observer> observer)
    : observer_{observer}, connection_established_(false), stream_id_{stream_id}, work_thread_{WorkerThreadPool::GetInstance().GetWorkerThread()} {
    }

bool WebrtcStream::Start() {
  udp_socket_.reset(new UdpSocket(work_thread_->MessageLoop(), this, 5000));
  udp_socket_->SetMinMaxPort(ServerConfig::GetInstance().GetWebRtcMinPort(), ServerConfig::GetInstance().GetWebRtcMaxPort());
  if (!udp_socket_->Listen(ServerConfig::GetInstance().GetIp()))
    return false;
  ice_lite_.reset(new IceLite(sdp_.GetRemoteIceUfrag(), this));
  send_srtp_session_.reset(new SrtpSession());
  recv_srtp_session_.reset(new SrtpSession());
  dtls_transport_.reset(new DtlsTransport(work_thread_->MessageLoop(), this));
  dtls_transport_->SetRemoteFingerprint(sdp_.GetRemoteFingerprintType(), sdp_.GetRemoteFingerprintHash().c_str());
  if (!dtls_transport_->Init())
    return false;
  sdp_.SetLocalHostAddress(ServerConfig::GetInstance().GetAnnouncedIp(), udp_socket_->GetListeningPort());
  sdp_.SetLocalFingerprint("sha-256", DtlsContext::GetInstance().GetCertificateFingerPrint(DtlsContext::Hash::kSha256));
  sdp_.SetLocalIceInfo(ice_lite_->GetLocalUfrag(), ice_lite_->GetLocalPassword());
  return true;
}

WebrtcStream::~WebrtcStream() {
  if (dtls_transport_)
    dtls_transport_->Stop();
  if (udp_socket_)
    udp_socket_->Close();
}

const std::string& WebrtcStream::GetStreamId() const {
  return stream_id_;
}

void WebrtcStream::Stop() {
  auto self(shared_from_this());
  work_thread_->PostAsync([self, this] {
    if (dtls_transport_)
      dtls_transport_->Stop();
    if (udp_socket_)
      udp_socket_->Close();
    Shutdown();
  });
}

void WebrtcStream::OnUdpSocketDataReceive(uint8_t* data, size_t len, udp::endpoint* remote_ep) {
  if (StunMessage::IsStun(data, len)) {
    if (ice_lite_)
      ice_lite_->ProcessStunMessage(data, len, remote_ep);
  } else if (DtlsContext::IsDtls(data, len)) {
    if (dtls_ready_ && dtls_transport_)
      dtls_transport_->ProcessDataFromPeer(data, len);
    else
      spdlog::warn("Dtls is not ready yet.");
  } else if (RtcpPacket::IsRtcp(data, len)) {
    if (!connection_established_)
      return;
    int length = 0;
    if (recv_srtp_session_&& !recv_srtp_session_->UnprotectRtcp(data, len, &length))
      return;
    OnRtcpPacketReceive(data, length);
  } else if (IsRtpPacket(data, len)) {
    if (!connection_established_)
      return;
    int length = 0;
    if (recv_srtp_session_ && !recv_srtp_session_->UnprotectRtp(data, len, &length))
      return;
    OnRtpPacketReceive(data, length);
  }
}

void WebrtcStream::OnUdpSocketError() {
  spdlog::error("Udp socket error.");
  Shutdown();
}

void WebrtcStream::OnStunMessageSend(uint8_t* data, size_t size, udp::endpoint* ep) {
  if (udp_socket_)
    udp_socket_->SendData(data, size, ep);
}

void WebrtcStream::OnIceConnectionCompleted() {
  selected_endpoint_ = *ice_lite_->GetFavoredCandidate();
  if (!dtls_transport_)
    return;
  if (!dtls_transport_->Start(sdp_.GetRemoteDtlsSetup()))
    spdlog::error("DtlsTransport start failed!");
  else
    dtls_ready_ = true;
}

void WebrtcStream::OnIceConnectionError() {
  spdlog::error("Ice connection error occurred.");
  Shutdown();
}

void WebrtcStream::OnDtlsTransportSendData(const uint8_t* data, size_t len) {
  if (udp_socket_)
    udp_socket_->SendData(data, len, &selected_endpoint_);
}

void WebrtcStream::OnDtlsTransportSetup(SrtpSession::CipherSuite suite, uint8_t* localMasterKey, int localMasterKeySize, uint8_t* remoteMasterKey, int remoteMasterKeySize) {
  spdlog::debug("DTLS ready.");
  CHECK(send_srtp_session_ != nullptr && recv_srtp_session_ != nullptr);
  if (!send_srtp_session_->Init(false, suite, localMasterKey, localMasterKeySize)
    || !recv_srtp_session_->Init(true, suite, remoteMasterKey, remoteMasterKeySize)) {
    spdlog::error("Srtp session init failed.");
    Shutdown();
    return;
  }
  if (observer_)
    observer_->OnWebrtcStreamConnected(stream_id_);
  connection_established_ = true;
}

void WebrtcStream::OnDtlsTransportError() {
  spdlog::error("Dtls setup error.");
  Shutdown();
}

void WebrtcStream::OnDtlsTransportShutdown() {
  Shutdown();
}

void WebrtcStream::Shutdown() {
  if (stoped_)
    return;
  if (observer_)
    observer_->OnWebrtcStreamShutdown(stream_id_);
  stoped_ = true;
}

void WebrtcStream::SendRtp(uint8_t* data, size_t size) {
  work_thread_->CheckInThisThread();
  if (!connection_established_)
    return;
  int protect_rtp_need_len = send_srtp_session_->GetProtectRtpNeedLength(size);
  UdpSocket::UdpMessage msg;
  msg.buffer.reset(new uint8_t[protect_rtp_need_len]);
  msg.endpoint = selected_endpoint_;
  memcpy(msg.buffer.get(), data, size);
  int length = 0;
  if (!send_srtp_session_->ProtectRtp(msg.buffer.get(), size, protect_rtp_need_len, &length)) {
    spdlog::error("Failed to encrypt RTP packat.");
    return;
  }
  msg.length = length;
  if (udp_socket_)
    udp_socket_->SendData(std::move(msg));
  else
    spdlog::error("Send data before socket is connected.");
}

void WebrtcStream::SendRtcp(uint8_t* data, size_t size) {
  work_thread_->CheckInThisThread();
  if (!connection_established_)
    return;
  int protect_rtcp_need_len = send_srtp_session_->GetProtectRtcpNeedLength(size);
  UdpSocket::UdpMessage msg;
  msg.buffer.reset(new uint8_t[protect_rtcp_need_len]);
  msg.endpoint = selected_endpoint_;
  memcpy(msg.buffer.get(), data, size);
  int length = 0;
  if (!send_srtp_session_->ProtectRtcp(msg.buffer.get(), size, protect_rtcp_need_len, &length)) {
    spdlog::error("Failed to encrypt RTCP packat.");
    return;
  }
  msg.length = length;
  if (udp_socket_)
    udp_socket_->SendData(std::move(msg));
  else
    spdlog::error("Send data before socket is connected.");
}

const Sdp& WebrtcStream::GetSdp() const {
  return sdp_;
}