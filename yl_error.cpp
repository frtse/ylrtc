#include "yl_error.h"

const char* YlErrorToString(YlError error) {
  switch (error) {
    case kOk:
      return "Ok.";
    case kRoomIdAlreadyExists:
      return "Room ID already exists.";
    case kParticipantAlreadyJoined:
      return "Participant already joined.";
    default:
      return "Unknown error.";
  }
}