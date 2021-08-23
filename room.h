#pragma once

#include <string>
#include <unordered_map>
#include <unordered_set>

#include "publish_stream.h"
#include "random.h"
#include "sdptransform/json.hpp"
#include "subscribe_stream.h"
#include "webrtc_stream.h"

class Room : public WebrtcStream::Observer {
 public:
  explicit Room(const std::string& id);
  const std::string& Id() const;

  bool Join(const std::string& participant_id);
  void Leave(const std::string& participant_id);
  PublishStream* ParticipantPublish(const std::string& participant_id, const std::string& offer);
  SubscribeStream* ParticipantSubscribe(const std::string& src_participant_id,
                                        const std::string& dst_participant_id,
                                        const std::string& stream_id,
                                        const std::string& sdp);

  nlohmann::json GetRoomInfo();

 private:
  void OnWebrtcStreamConnected(const std::string& stream_id) override;
  void OnWebrtcStreamShutdown(const std::string& stream_id) override;
  Room(const Room&) = delete;
  Room& operator=(const Room&) = delete;
  const static uint32_t kParticipantIdLength = 64;
  std::string id_;
  std::unordered_set<std::string> participant_id_set_;
  std::unordered_map<std::string, std::unordered_set<PublishStream*>> participant_publishs_map_;
  std::unordered_map<std::string, std::unordered_set<SubscribeStream*>> participant_subscribes_map_;
  std::unordered_map<PublishStream*, std::unordered_set<SubscribeStream*>> publish_subscribes_map_;
  Random random_;
};