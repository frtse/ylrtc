#pragma once

#include <cstdint>
#include <memory>
#include <string>
#include <unordered_map>
#include <vector>
#include <optional>

#include "boost/asio.hpp"
#include "nack_requester.h"
#include "random.h"
#include "receive_side_twcc.h"
#include "track_statistics.h"
#include "rtcp_packet.h"
#include "rtp_header_extension.h"
#include "rtp_packet.h"
#include "threads.h"
#include "timer.h"

class PublishStreamTrack : public Timer::Observer
  , public NackRequester::Observer
  , public std::enable_shared_from_this<PublishStreamTrack> {
 public:
  struct Configuration {
    uint32_t ssrc;
    uint8_t payload_type;
    std::optional<uint32_t> rtx_ssrc;
    uint8_t rtx_payload_type{0};
    bool rtx_enabled{false};
    bool nack_enabled{false};
    std::string codec;
    uint32_t rid{0};
    bool audio{false};
    bool rtcpfb_pli{false};
    bool rtcpfb_fir{false};
    uint32_t clock_rate{0};
    RtpHeaderExtensionCapability extension_capability;
  };

  class Observer {
   public:
    virtual void OnPublishStreamTrackSendRtcpPacket(RtcpPacket& rtcp_packet) = 0;
  };

  PublishStreamTrack(const Configuration& configuration, boost::asio::io_context& io_context, Observer* observer);
  void Init();
  void Deinit();
  bool ReceiveRtpPacket(std::shared_ptr<RtpPacket> rtp_packet);
  Configuration& Config();
  void SetRtxSSRC(uint32_t ssrc);
  void SendRequestkeyFrame();
  void ReceiveDlrrSubBlock(const ReceiveTimeInfo& sub_block);
  void ReceiveSenderReport(SenderReportPacket* sr);
  std::optional<SenderReportPacket> LastSr() const;
  int64_t Bitrate();

 private:
  void OnNackRequesterRequestNack(const std::vector<uint16_t>& nack_list) override;
  void OnNackRequesterRequestKeyFrame() override;
  void OnTimerTimeout() override;
  std::shared_ptr<Timer> rtcp_timer_;
  int64_t report_interval_;
  Configuration configuration_;
  TrackStatistics track_statistics_;
  std::unique_ptr<TrackStatistics> rtx_track_statistics_;
  boost::asio::io_context& io_context_;
  std::shared_ptr<NackRequester> nack_request_;
  uint8_t fir_seq_num_{0};
  Random random_;
  int64_t rtt_millis_{100};
  Observer* observer_;
  std::optional<SenderReportPacket> last_sr_;
};