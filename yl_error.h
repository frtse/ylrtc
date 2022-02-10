#pragma once

#include <cstddef>

enum YlError : int { kOk = 0,
                     kRoomIdAlreadyExists,
                     kParticipantAlreadyJoined,
                     kNoRoomWithCorrespondingID,
                     kSubscriptionFailed,
                     kPublishFailed,
                     kFailedToJoinRoom,
                     kNoStreamWithCorrespondingIdFound,
                     kUnsupportedActions};

const char* YlErrorToString(YlError error);