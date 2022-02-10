#include "yl_error.h"

const char* YlErrorToString(YlError error) {
  switch (error) {
    case kOk:
      return "Ok.";
    case kRoomIdAlreadyExists:
      return "Room ID already exists.";
    case kParticipantAlreadyJoined:
      return "Participant already joined.";
    case kNoRoomWithCorrespondingID:
      return "No room with corresponding id.";
    case kSubscriptionFailed:
      return "Subscription failed.";
    case kPublishFailed:
      return "Publish failed.";
    case kFailedToJoinRoom:
      return "Failed to join room.";
    case kNoStreamWithCorrespondingIdFound:
      return "No stream with corresponding id found.";
    case kUnsupportedActions:
      return "Unsupported actions.";
    default:
      return "Unknown error.";
  }
}