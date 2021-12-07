#pragma once

#include <cstddef>

enum WmsError : int {
  kWmsOk = 0
};

const char* WmsErrorToString(WmsError error);
