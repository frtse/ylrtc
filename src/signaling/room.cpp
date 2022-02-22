#include "room.h"

#include <vector>

#include "notification.h"
#include "signaling_server.h"
#include "spdlog/spdlog.h"

Room::Room(const std::string& id) : id_{id} {}

const std::string& Room::Id() const {
  return id_;
}

YlError Room::Join(const std::string& participant_id) {
  if (participant_id_set_.find(participant_id) != participant_id_set_.end())
    return kParticipantAlreadyJoined;
  participant_id_set_.insert(participant_id);
  auto notification = Notification::MakeParticipantJoinedNotification(id_, participant_id);
  SignalingServer::GetInstance().Notify(notification);
  return kOk;
}

void Room::Leave(const std::string& participant_id) {
  auto participant_publishs_map_iter = participant_publishs_map_.find(participant_id);
  if (participant_publishs_map_iter != participant_publishs_map_.end()) {
    auto& publish_stream_set = participant_publishs_map_iter->second;
    for (auto publish_stream : publish_stream_set)
      publish_stream->Stop();
  }
  auto participant_subscribes_map_iter = participant_subscribes_map_.find(participant_id);
  if (participant_subscribes_map_iter != participant_subscribes_map_.end()) {
    auto& subscribe_stream_set = participant_subscribes_map_iter->second;
    for (auto subscribe_stream : subscribe_stream_set)
      subscribe_stream->Stop();
  }
  auto result = participant_id_set_.find(participant_id);
  if (result != participant_id_set_.end()) {
    participant_id_set_.erase(result);
    auto notification = Notification::MakeParticipantLeftNotification(id_, participant_id);
    SignalingServer::GetInstance().Notify(notification);
  }
}

void Room::KickoutParticipant(const std::string& participant_id) {
  Leave(participant_id);
}

std::shared_ptr<PublishStream> Room::ParticipantPublish(const std::string& participant_id, const std::string& offer) {
  if (participant_id_set_.find(participant_id) == participant_id_set_.end())
    return nullptr;
  std::string stream_id;
  while (true) {
    stream_id = random_.RandomString(64);
    if (!StreamIdExist(stream_id))
      break;
  }
  auto publish_stream = std::make_shared<PublishStream>(id_, stream_id, shared_from_this());
  publish_stream->Init();
  if (!publish_stream->SetRemoteDescription(offer))
    return nullptr;
  if (!publish_stream->Start())
    return nullptr;
  auto& publish_stream_set = participant_publishs_map_[participant_id];
  publish_stream_set.insert(publish_stream);
  return publish_stream;
}

std::shared_ptr<SubscribeStream> Room::ParticipantSubscribe(const std::string& src_participant_id,
                                                            const std::string& dst_participant_id,
                                                            const std::string& stream_id,
                                                            const std::string& sdp) {
  if (participant_id_set_.find(src_participant_id) == participant_id_set_.end())
    return nullptr;
  if (participant_id_set_.find(dst_participant_id) == participant_id_set_.end())
    return nullptr;
  auto participant_publishs_map_iter = participant_publishs_map_.find(dst_participant_id);
  if (participant_publishs_map_iter == participant_publishs_map_.end())
    return nullptr;
  auto publish_stream_set = participant_publishs_map_iter->second;
  auto publish_stream_set_iter =
      std::find_if(publish_stream_set.begin(), publish_stream_set.end(), [&](auto stream) { return stream_id == stream->GetStreamId(); });
  if (publish_stream_set_iter == publish_stream_set.end())
    return nullptr;
  auto publish_stream = *publish_stream_set_iter;
  std::string subscribe_stream_id;
  while (true) {
    subscribe_stream_id = random_.RandomString(64);
    if (!StreamIdExist(subscribe_stream_id))
      break;
  }
  auto subscribe_stream = std::make_shared<SubscribeStream>(id_, subscribe_stream_id, shared_from_this());
  subscribe_stream->SetSdpNegotiator(publish_stream->GetSdpNegotiator());
  if (!subscribe_stream->SetRemoteDescription(sdp))
    return nullptr;
  if (!subscribe_stream->Start())
    return nullptr;
  publish_stream->RegisterDataObserver(subscribe_stream);
  publish_subscribes_map_[publish_stream].insert(subscribe_stream);
  auto& subscribe_stream_set = participant_subscribes_map_[src_participant_id];
  subscribe_stream_set.insert(subscribe_stream);
  return subscribe_stream;
}

void Room::OnWebrtcStreamConnected(const std::string& stream_id) {
  auto self(shared_from_this());
  MainThread::GetInstance().PostAsync([self, this, stream_id] {
    for (auto iter = participant_publishs_map_.begin(); iter != participant_publishs_map_.end(); ++iter) {
      auto& publish_streams = iter->second;
      auto publish_streams_iter =
          std::find_if(publish_streams.begin(), publish_streams.end(), [stream_id](auto s) { return s->GetStreamId() == stream_id; });
      if (publish_streams_iter != publish_streams.end()) {
        auto notification =
            Notification::MakeStreamAddedNotification(id_, iter->first, (*publish_streams_iter)->GetStreamId(), (*publish_streams_iter)->GetSdpNegotiator());
        SignalingServer::GetInstance().Notify(notification);
      }
    }

    for (auto publish_subscribes_map_iter = publish_subscribes_map_.begin(); publish_subscribes_map_iter != publish_subscribes_map_.end();
         ++publish_subscribes_map_iter) {
      auto& subscribe_stream_set = publish_subscribes_map_iter->second;
      auto publish_stream = publish_subscribes_map_iter->first;
      for (auto subscribe_stream_set_iter = subscribe_stream_set.begin(); subscribe_stream_set_iter != subscribe_stream_set.end();
           ++subscribe_stream_set_iter) {
        if ((*subscribe_stream_set_iter)->GetStreamId() == stream_id)
          publish_stream->SendRequestkeyFrame();
      }
      if (publish_stream->GetStreamId() == stream_id)
        publish_stream->SendRequestkeyFrame();
    }
  });
}

void Room::OnWebrtcStreamShutdown(const std::string& stream_id) {
  auto self(shared_from_this());
  MainThread::GetInstance().PostAsync([self, this, stream_id] {
    for (auto iter = participant_publishs_map_.begin(); iter != participant_publishs_map_.end();) {
      auto& publish_stream_set = iter->second;
      auto publish_stream_set_iter =
          std::find_if(publish_stream_set.begin(), publish_stream_set.end(), [stream_id](auto stream) { return stream_id == stream->GetStreamId(); });
      if (publish_stream_set_iter != publish_stream_set.end()) {
        auto notification = Notification::MakeStreamRemovedNotification(id_, iter->first, (*publish_stream_set_iter)->GetStreamId());
        SignalingServer::GetInstance().Notify(notification);

        auto publish_stream = *publish_stream_set_iter;
        auto publish_subscribes_map_iter = publish_subscribes_map_.find(publish_stream);
        if (publish_subscribes_map_iter != publish_subscribes_map_.end()) {
          auto& subscribe_stream_set = publish_subscribes_map_iter->second;
          for (auto subscribe_stream : subscribe_stream_set) {
            publish_stream->UnregisterDataObserver(subscribe_stream);
            subscribe_stream->Stop();
          }
          publish_subscribes_map_.erase(publish_subscribes_map_iter);
        }
        publish_stream_set.erase(publish_stream_set_iter);
      }
      if (publish_stream_set.empty())
        participant_publishs_map_.erase(iter++);
      else
        ++iter;
    }

    for (auto iter = participant_subscribes_map_.begin(); iter != participant_subscribes_map_.end();) {
      auto& subscribe_stream_set = iter->second;
      auto subscribe_stream_set_iter = std::find_if(subscribe_stream_set.begin(), subscribe_stream_set.end(),
                                                    [&stream_id](auto stream) { return stream_id == stream->GetStreamId(); });

      if (subscribe_stream_set_iter != subscribe_stream_set.end()) {
        auto subscribe_stream = *subscribe_stream_set_iter;
        for (auto publish_subscribes_map_iter = publish_subscribes_map_.begin(); publish_subscribes_map_iter != publish_subscribes_map_.end();
             ++publish_subscribes_map_iter) {
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
      if (subscribe_stream_set.empty())
        participant_subscribes_map_.erase(iter++);
      else
        ++iter;
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
        spdlog::debug("Publish stream id {}.", s->GetStreamId());
      }
    }

    spdlog::debug("Print participant subscribes map.");
    for (auto e : participant_subscribes_map_) {
      spdlog::debug("Participant id {}.", e.first);
      for (auto s : e.second) {
        spdlog::debug("Subscribe stream id {}.", s->GetStreamId());
      }
    }

    spdlog::debug("Print publish subscribes map.");
    for (auto e : publish_subscribes_map_) {
      spdlog::debug("Publish stream id {}.", e.first->GetStreamId());
      for (auto s : e.second) {
        spdlog::debug("Subscribe stream id {}.", s->GetStreamId());
      }
    }
#endif
  });
}

bool Room::StreamIdExist(const std::string& stream_id) {
  for (auto& iter : participant_publishs_map_) {
    auto& publishs = iter.second;
    auto result =
        std::find_if(publishs.begin(), publishs.end(), [&stream_id](auto& publish_stream) { return publish_stream->GetStreamId() == stream_id; });
    if (result != publishs.end())
      return true;
  }
  for (auto& iter : participant_subscribes_map_) {
    auto& subscribes = iter.second;
    auto result = std::find_if(subscribes.begin(), subscribes.end(),
                               [&stream_id](auto& subscribe_stream) { return subscribe_stream->GetStreamId() == stream_id; });
    if (result != subscribes.end())
      return true;
  }
  return false;
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
      if (j && j->Connected()) {
        nlohmann::json stream;
        stream["participantId"] = participant_id;
        stream["publishStreamId"] = j->GetStreamId();
        stream["hasVideo"] = j->HasVideo();
        stream["hasAudio"] = j->HasAudio();
        streams.push_back(stream);
      }
    }
  }
  info["streams"] = streams;
  return info;
}

std::shared_ptr<WebrtcStream> Room::GetStreamById(const std::string& id) {
  for (auto iter = participant_publishs_map_.begin(); iter != participant_publishs_map_.end(); ++iter) {
    auto& publish_stream_set = iter->second;
    auto result = std::find_if(publish_stream_set.cbegin(), publish_stream_set.cend(), [&id](auto& e) { return e->GetStreamId() == id; });
    if (result != publish_stream_set.cend())
      return *result;
  }

  for (auto iter = participant_subscribes_map_.begin(); iter != participant_subscribes_map_.end(); ++iter) {
    auto& subscribe_stream_set = iter->second;
    auto result = std::find_if(subscribe_stream_set.cbegin(), subscribe_stream_set.cend(), [&id](auto& e) { return e->GetStreamId() == id; });
    if (result != subscribe_stream_set.cend())
      return *result;
  }

  return nullptr;
}

Room::~Room() {
  spdlog::debug("~Room");
}

void Room::Destroy() {
  for (auto iter = participant_publishs_map_.begin(); iter != participant_publishs_map_.end(); ++iter) {
    auto& publish_stream_set = iter->second;
    for (auto publish_stream : publish_stream_set)
      publish_stream->Stop();
  }
  for (auto iter = participant_subscribes_map_.begin(); iter != participant_subscribes_map_.end(); ++iter) {
    auto& subscribe_stream_set = iter->second;
    for (auto subscribe_stream : subscribe_stream_set)
      subscribe_stream->Stop();
  }
}