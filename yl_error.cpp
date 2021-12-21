#include "yl_error.h"

const char* YlErrorToString(YlError error) {
  switch(error) {
    case kOk:
      return "Ok.";
    case kRoomIdAlreadyExists:
      return "Room ID already exists.";
    default:
      return "Unknown error.";
  }
}