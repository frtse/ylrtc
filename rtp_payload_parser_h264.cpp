#include "rtp_payload_parser_h264.h"

#include <arpa/inet.h>
#include <string.h>

std::optional<PayloadInfo> RtpPayloadParserH264::Parse(uint8_t* buffer, size_t len) {
  PayloadInfo info;
  info.keyframe = false;
  if(!buffer || len < 6)
    return info;
  /* Parse H264 header now */
  uint8_t fragment = *buffer & 0x1F;
  uint8_t nal = *(buffer+1) & 0x1F;
  if(fragment == 7 || ((fragment == 28 || fragment == 29) && nal == 7)) {
    info.keyframe = true;
    return info;
  } else if(fragment == 24) {
    /* May we find an SPS in this STAP-A? */
    buffer++;
    len--;
    uint16_t psize = 0;
    /* We're reading 3 bytes */
    while(len > 2) {
      memcpy(&psize, buffer, 2);
      psize = ntohs(psize);
      buffer += 2;
      len -= 2;
      int nal = *buffer & 0x1F;
      if(nal == 7) {
        info.keyframe = true;
        return info;
      }
      buffer += psize;
      len -= psize;
    }
  }
  return info;
}
