#pragma once

#include <cstddef>

enum YlError : int {
  kWmsOk = 0
};

const char* YlErrorToString(YlError error);
