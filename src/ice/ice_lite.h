#pragma once

#include <boost/asio.hpp>
#include <cstddef>
#include <string>
#include <memory>

#include "random.h"

using udp = boost::asio::ip::udp;

/**
 * @brief In ice-lite mode, process STUN messages and detect ICE status.
 * 
 */
class IceLite {
 public:
  class Observer {
   public:
    // Send STUN message to [ep].
    virtual void OnStunMessageSend(std::shared_ptr<uint8_t> data, size_t size, udp::endpoint* ep) = 0;
    // Ice connection complete.
    virtual void OnIceConnectionCompleted() = 0;
    // Ice connection error.
    virtual void OnIceConnectionError() = 0;
  };

  IceLite(const std::string& room_id, const std::string& stream_id, const std::string& remote_ufrag, Observer* observer);

  /**
   * @brief Process the STUN message sent by [remote_ep].
   * 
   */
  void ProcessStunMessage(uint8_t* data, size_t len, udp::endpoint* remote_ep);
  const std::string& LocalUfrag() const;
  const std::string& LocalPassword() const;
  const udp::endpoint* SelectedCandidate() const;

  // For test.
  void LocalPassword(const std::string& pwd);

 private:
  constexpr static uint32_t kDefaultPasswordLength = 24;
  Random random_;
  std::string local_ufrag_;
  std::string local_password_;
  std::string remote_ufrag_;
  Observer* observer_;
  udp::endpoint selected_candidate_;
  udp::endpoint old_selected_candidate_;
};