#pragma once

#include <cstddef>

enum YlError : int {
  kOk = 0,
  kRoomIdAlreadyExists,
};

const char* YlErrorToString(YlError error);
