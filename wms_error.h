#pragma once

#include <cstddef>

using WmsResult = size_t;
constexpr size_t kWmsOk = 0;

const char* WmsResultToString(WmsResult result);
