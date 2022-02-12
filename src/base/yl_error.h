#pragma once

enum YlError : int { kOk = 0,
                     kRoomIdAlreadyExists,
                     kParticipantAlreadyJoined,
                     kNoRoomWithCorrespondingID,
                     kSubscriptionFailed,
                     kPublishFailed,
                     kFailedToJoinRoom,
                     kNoStreamWithCorrespondingIdFound,
                     kUnsupportedActions,
                     kErrorUnknown};

const char* YlErrorToString(YlError error);