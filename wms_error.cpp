#include "wms_error.h"

const char* WmsResultToString(WmsResult result) {
  switch(result) {
    case kWmsOk:
      return "Ok.";
    default:
      return "Unknown result.";
  }
}
