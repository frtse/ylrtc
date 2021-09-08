#include "webrtc_stream.h"

#include <iostream>

#include "dtls_context.h"
#include "rtcp_packet.h"
#include "rtp_packet.h"
#include "rtp_utils.h"
#include "sdptransform/sdptransform.hpp"
#include "server_config.h"
#include "signaling_server.h"
#include "stun_message.h"
#include "utils.h"

WebrtcStream::WebrtcStream(const std::string& stream_id, Observer* observer)
    : observer_{observer}, connection_established_(false), stream_id_{stream_id}, work_thread_{WorkerThreadPool::GetInstance().GetWorkerThread()} {}

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
  Stop();
}

void WebrtcStream::Stop() {
  udp_socket_->Close();
  if (dtls_transport_)
    dtls_transport_->Stop();
}

void WebrtcStream::OnUdpSocketDataReceive(uint8_t* data, size_t len, udp::endpoint* remote_ep) {
  if (StunMessage::IsStun(data, len)) {
    ice_lite_->ProcessStunMessage(data, len, remote_ep);
  } else if (DtlsContext::IsDtls(data, len)) {
    if (dtls_ready_)
      dtls_transport_->ProcessDataFromPeer(data, len);
    else
      spdlog::warn("Dtls is not ready yet.");
  } else if (RtcpPacket::IsRtcp(data, len)) {
    int length = 0;
    if (!recv_srtp_session_->UnprotectRtcp(data, len, &length)) {
      spdlog::warn("Failed to unprotect the incoming RTCP packet.");
    }

    OnRtcpPacketReceive(data, length);

  } else if (IsRtpPacket(data, len)) {
    int length = 0;
    if (!recv_srtp_session_->UnprotectRtp(data, len, &length)) {
      spdlog::warn("Failed to unprotect the incoming RTP packet.");
    }

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

  if (!dtls_transport_->Start(sdp_.GetRemoteDtlsSetup())) {
    spdlog::error("DtlsTransport start failed!");
  } else {
    dtls_ready_ = true;
  }
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
  if (!send_srtp_session_->Init(false, suite, localMasterKey, localMasterKeySize))
    spdlog::error("Srtp send session init failed.");
  if (!recv_srtp_session_->Init(true, suite, remoteMasterKey, remoteMasterKeySize))
    spdlog::error("Srtp revc session init failed.");
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
  if (observer_)
    observer_->OnWebrtcStreamShutdown(stream_id_);
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