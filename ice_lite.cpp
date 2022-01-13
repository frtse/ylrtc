#include "ice_lite.h"

#include "spdlog/spdlog.h"
#include "stun_message.h"

IceLite::IceLite(const std::string& remote_ufrag, Observer* observer)
    : local_ufrag_{random_.RandomString(kDefaultUfragLength)}, local_password_{random_.RandomString(kDefaultPasswordLength)}, remote_ufrag_{remote_ufrag}, observer_{observer} {}

void IceLite::ProcessStunMessage(uint8_t* data, size_t len, udp::endpoint* remote_ep) {
  StunMessage msg(local_ufrag_, local_password_, remote_ufrag_);
  if (!msg.Parse(data, len)) {
    spdlog::error("Stun message parsing error from [ip: {}, port {}]", remote_ep->address().to_string(), remote_ep->port());
    if (observer_)
      observer_->OnIceConnectionError();
    return;
  }

  valid_candidates_.insert(*remote_ep);
  if (msg.HasUseCandidate()) {
    auto result = valid_candidates_.find(*remote_ep);
    if (result != valid_candidates_.end()) {
      old_favored_candidate_ = favored_candidate_;
      favored_candidate_ = *remote_ep;
      if (old_favored_candidate_ != favored_candidate_) {
        spdlog::debug("Ice connect completed. remote: [ip: {}, port {}]", remote_ep->address().to_string(), remote_ep->port());
        if (observer_)
          observer_->OnIceConnectionCompleted();
      }
    }
  }

  msg.SetXorMappedAddress(remote_ep);
  msg.CreateResponse();
  if (observer_)
    observer_->OnStunMessageSend(msg.Data(), msg.Size(), remote_ep);
}

const std::string& IceLite::LocalUfrag() const {
  return local_ufrag_;
}

const std::string& IceLite::LocalPassword() const {
  return local_password_;
}

const udp::endpoint* IceLite::FavoredCandidate() const {
  return &favored_candidate_;
}