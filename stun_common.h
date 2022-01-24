#pragma once

#include <cstddef>
#include <cstdint>
#include <optional>
#include <string>

// The mask used to determine whether a STUN message is a request/response etc.
static const uint32_t kStunTypeMask = 0x0110;

// STUN Attribute header length.
static const size_t kStunAttributeHeaderSize = 4;

// Following values correspond to RFC5389.
static const size_t kStunHeaderSize = 20;
static const size_t kStunTransactionIdLength = 12;
static const uint32_t kStunMagicCookie = 0x2112A442;
static const uint32_t kLengthOffset = 2;
static const uint32_t kFingerprintAttrLength = 4;
static constexpr size_t kStunMagicCookieLength = sizeof(kStunMagicCookie);

/**
 * @brief Test if the data is in stun format.
 *
 */
bool IsStun(uint8_t* data, size_t size);

/**
 * @brief Making ufrag with room ID and stream ID.
 *
 */
std::string MakeUfrag(const std::string& room_id, const std::string& stream_id);

/**
 * @brief Extract the room ID and stream ID in ufrag.
 *
 */
bool ExtractUfragInfo(const std::string& ufrag, std::string& room_id, std::string& stream_id);

/**
 * @brief No other checks, get username field quickly.
 *
 */
std::optional<std::string> FastGetLocalUfrag(uint8_t* data, size_t size);