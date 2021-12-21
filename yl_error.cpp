#include "yl_error.h"

const char* YlErrorToString(YlError error) {
  switch(error) {
    case kOk:
      return "Ok.";
    default:
      return "Unknown result.";
  }
}
