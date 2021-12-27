#pragma once

#include <cstddef>

enum YlError : int {
  kOk = 0,
  kRoomIdAlreadyExists,
  kParticipantAlreadyJoined
};

const char* YlErrorToString(YlError error);
