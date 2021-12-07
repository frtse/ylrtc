#include "wms_error.h"

const char* WmsErrorToString(WmsError error) {
  switch(error) {
    case kWmsOk:
      return "Ok.";
    default:
      return "Unknown result.";
  }
}
