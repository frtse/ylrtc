#include "room.h"

#include <vector>

#include "notification.h"
#include "signaling_server.h"
#include "spdlog/spdlog.h"

Room::Room(const std::string& id) : id_{id} {}

const std::string& Room::Id() const {
  return id_;
}

bool Room::Join(const std::string& participant_id) {
  if (participant_id_set_.find(participant_id) != participant_id_set_.end())
    return false;
  participant_id_set_.insert(participant_id);
  auto notification = Notification::MakeParticipantJoinedNotification(id_, participant_id);
  SignalingServer::GetInstance().Notify(notification);
  return true;
}

void Room::Leave(const std::string& participant_id) {
  auto result = participant_id_set_.find(participant_id);
  if (result != participant_id_set_.end()) {
    participant_id_set_.erase(result);
    auto notification = Notification::MakeParticipantLeftNotification(id_, participant_id);
    SignalingServer::GetInstance().Notify(notification);
  }
}

std::shared_ptr<PublishStream> Room::ParticipantPublish(const std::string& participant_id, const std::string& offer) {
  if (participant_id_set_.find(participant_id) == participant_id_set_.end())
    return nullptr;
  std::string stream_id = random_.RandomString(64);
  auto publish_stream = std::make_shared<PublishStream>(stream_id, this);

  if (!publish_stream->SetRemoteDescription(offer)) {
    return nullptr;
  }
  if (!publish_stream->Start()) {
    return nullptr;
  }

  auto& publish_stream_set = participant_publishs_map_[participant_id];
  publish_stream_set.insert(publish_stream);
  return publish_stream;
}

std::shared_ptr<SubscribeStream> Room::ParticipantSubscribe(const std::string& src_participant_id, const std::string& dst_participant_id, const std::string& stream_id, const std::string& sdp) {
  if (participant_id_set_.find(src_participant_id) == participant_id_set_.end())
    return nullptr;
  if (participant_id_set_.find(dst_participant_id) == participant_id_set_.end())
    return nullptr;
  auto participant_publishs_map_iter = participant_publishs_map_.find(dst_participant_id);
  if (participant_publishs_map_iter == participant_publishs_map_.end())
    return nullptr;
  auto publish_stream_set = participant_publishs_map_iter->second;
  auto publish_stream_set_iter = std::find_if(publish_stream_set.begin(), publish_stream_set.end(), [&](auto stream) { return stream_id == stream->GetStreamId(); });

  if (publish_stream_set_iter == publish_stream_set.end())
    return nullptr;

  auto publish_stream = *publish_stream_set_iter;

  std::string subscribe_stream_id = random_.RandomString(64);
  auto subscribe_stream = std::make_shared<SubscribeStream>(subscribe_stream_id, this);

  subscribe_stream->SetPublishSdp(publish_stream->GetSdp());

  if (!subscribe_stream->SetRemoteDescription(sdp)) {
    return nullptr;
  }

  if (!subscribe_stream->Start()) {
    return nullptr;
  }

  publish_stream->RegisterDataObserver(subscribe_stream);
  publish_subscribes_map_[publish_stream].insert(subscribe_stream);
  auto& subscribe_stream_set = participant_subscribes_map_[src_participant_id];
  subscribe_stream_set.insert(subscribe_stream);
  return subscribe_stream;
}

void Room::OnWebrtcStreamConnected(const std::string& stream_id) {
  MainThread::GetInstance().PostAsync([this, stream_id] {
    for (auto iter = participant_publishs_map_.begin(); iter != participant_publishs_map_.end(); ++iter) {
      auto& publish_streams = iter->second;
      auto publish_streams_iter = std::find_if(publish_streams.begin(), publish_streams.end(), [stream_id](auto s) { return s->GetStreamId() == stream_id; });

      if (publish_streams_iter != publish_streams.end()) {
        auto notification = Notification::MakeStreamAddedNotification(id_, iter->first, (*publish_streams_iter)->GetStreamId(), (*publish_streams_iter)->GetSdp());
        SignalingServer::GetInstance().Notify(notification);
      }
    }

    for (auto publish_subscribes_map_iter = publish_subscribes_map_.begin(); publish_subscribes_map_iter != publish_subscribes_map_.end(); ++publish_subscribes_map_iter) {
      auto& subscribe_stream_set = publish_subscribes_map_iter->second;
      auto publish_stream = publish_subscribes_map_iter->first;
      for (auto subscribe_stream_set_iter = subscribe_stream_set.begin(); subscribe_stream_set_iter != subscribe_stream_set.end(); ++subscribe_stream_set_iter) {
        if ((*subscribe_stream_set_iter)->GetStreamId() == stream_id) {
          publish_stream->SendRequestkeyFrame();
        }
      }

      if (publish_stream->GetStreamId() == stream_id)
        publish_stream->SendRequestkeyFrame();
    }
  });
}

void Room::OnWebrtcStreamShutdown(const std::string& stream_id) {
  MainThread::GetInstance().PostAsync([this, stream_id] {
    for (auto iter = participant_publishs_map_.begin(); iter != participant_publishs_map_.end(); ++iter) {
      auto& publish_stream_set = iter->second;
      auto publish_stream_set_iter = std::find_if(publish_stream_set.begin(), publish_stream_set.end(), [stream_id](auto stream) { return stream_id == stream->GetStreamId(); });
      if (publish_stream_set_iter != publish_stream_set.end()) {
        auto notification = Notification::MakeStreamRemovedNotification(id_, iter->first, (*publish_stream_set_iter)->GetStreamId());
        SignalingServer::GetInstance().Notify(notification);

        auto publish_stream = *publish_stream_set_iter;
        auto publish_subscribes_map_iter = publish_subscribes_map_.find(publish_stream);
        if (publish_subscribes_map_iter != publish_subscribes_map_.end()) {
          auto& subscribe_stream_set = publish_subscribes_map_iter->second;
          for (auto subscribe_stream : subscribe_stream_set) {
            publish_stream->UnregisterDataObserver(subscribe_stream);
          }
          publish_subscribes_map_.erase(publish_subscribes_map_iter);
        }
        publish_stream_set.erase(publish_stream_set_iter);
      }
    }

    for (auto iter = participant_subscribes_map_.begin(); iter != participant_subscribes_map_.end(); ++iter) {
      auto& subscribe_stream_set = iter->second;
      auto subscribe_stream_set_iter = std::find_if(subscribe_stream_set.begin(), subscribe_stream_set.end(), [&stream_id](auto stream) { return stream_id == stream->GetStreamId(); });

      if (subscribe_stream_set_iter != subscribe_stream_set.end()) {
        auto subscribe_stream = *subscribe_stream_set_iter;
        for (auto publish_subscribes_map_iter = publish_subscribes_map_.begin(); publish_subscribes_map_iter != publish_subscribes_map_.end(); ++publish_subscribes_map_iter) {
          auto& subscribe_stream_set = publish_subscribes_map_iter->second;
          auto publish_stream = publish_subscribes_map_iter->first;
          for (auto subscribe_stream_set_iter = subscribe_stream_set.begin(); subscribe_stream_set_iter != subscribe_stream_set.end();) {
            if ((*subscribe_stream_set_iter)->GetStreamId() == stream_id) {
              publish_stream->UnregisterDataObserver(*subscribe_stream_set_iter);
              subscribe_stream_set.erase(subscribe_stream_set_iter++);
            } else
              ++subscribe_stream_set_iter;
          }
        }
        subscribe_stream_set.erase(subscribe_stream_set_iter);
      }
    }
#if 1
    spdlog::debug("Print participant id set.");
    for (auto id : participant_id_set_) {
      spdlog::debug("Participant id {}.", id);
    }

    spdlog::debug("Print participant publishs map.");
    for (auto e : participant_publishs_map_) {
      spdlog::debug("Participant id {}.", e.first);
      for (auto s : e.second) {
        spdlog::debug("Publish strem id {}.", s->GetStreamId());
      }
    }

    spdlog::debug("Print participant subscribes map.");
    for (auto e : participant_subscribes_map_) {
      spdlog::debug("Participant id {}.", e.first);
      for (auto s : e.second) {
        spdlog::debug("Subscribe strem id {}.", s->GetStreamId());
      }
    }

    spdlog::debug("Print publish subscribes map.");
    for (auto e : publish_subscribes_map_) {
      spdlog::debug("Publish strem id {}.", e.first->GetStreamId());
      for (auto s : e.second) {
        spdlog::debug("Subscribe strem id {}.", s->GetStreamId());
      }
    }
#endif
  });
}

nlohmann::json Room::GetRoomInfo() {
  nlohmann::json info;
  nlohmann::json participants = nlohmann::json::array();
  for (auto& participant : participant_id_set_)
    participants.push_back(participant);
  info["participants"] = participants;
  nlohmann::json streams = nlohmann::json::array();
  for (auto& i : participant_publishs_map_) {
    std::string participant_id = i.first;
    for (auto j : i.second) {
      nlohmann::json stream;
      stream["participantId"] = participant_id;
      stream["publishStreamId"] = j->GetStreamId();
      stream["hasVideo"] = j->GetSdp().HasVideo();
      stream["hasAudio"] = j->GetSdp().HasAudio();
      streams.push_back(stream);
    }
  }
  info["streams"] = streams;
  return info;
}

Room::~Room() {
  MainThread::GetInstance().PostAsync([this] {
    for (auto iter = participant_publishs_map_.begin(); iter != participant_publishs_map_.end(); ++iter) {
      auto& publish_stream_set = iter->second;
      for (auto publish_stream : publish_stream_set) {
        auto notification = Notification::MakeStreamRemovedNotification(id_, iter->first, publish_stream->GetStreamId());
        SignalingServer::GetInstance().Notify(notification);
        auto publish_subscribes_map_iter = publish_subscribes_map_.find(publish_stream);
        if (publish_subscribes_map_iter != publish_subscribes_map_.end()) {
          auto& subscribe_stream_set = publish_subscribes_map_iter->second;
          for (auto subscribe_stream : subscribe_stream_set) {
            publish_stream->UnregisterDataObserver(subscribe_stream);
          }
          publish_subscribes_map_.erase(publish_subscribes_map_iter);
        }
        publish_stream_set.erase(publish_stream);
      }
    }

    for (auto iter = participant_subscribes_map_.begin(); iter != participant_subscribes_map_.end(); ++iter) {
      auto& subscribe_stream_set = iter->second;
      for (auto subscribe_stream : subscribe_stream_set) {
        for (auto publish_subscribes_map_iter = publish_subscribes_map_.begin(); publish_subscribes_map_iter != publish_subscribes_map_.end(); ++publish_subscribes_map_iter) {
          auto& subscribe_stream_set = publish_subscribes_map_iter->second;
          auto publish_stream = publish_subscribes_map_iter->first;
          for (auto subscribe_stream_set_iter = subscribe_stream_set.begin(); subscribe_stream_set_iter != subscribe_stream_set.end();) {
            if ((*subscribe_stream_set_iter)->GetStreamId() == subscribe_stream->GetStreamId()) {
              publish_stream->UnregisterDataObserver(*subscribe_stream_set_iter);
              subscribe_stream_set.erase(subscribe_stream_set_iter++);
            } else
              ++subscribe_stream_set_iter;
          }
        }
        subscribe_stream_set.erase(subscribe_stream);
      }
    }
  });
}