class PublisheStream {
  constructor(mediaStream, streamId, pc, signaling) {
    this.mediaStream_ = mediaStream;
    this.streamId_ = streamId;
    this.pc_ = pc;
    this.signaling_ = signaling;
  }

  Id() {
    return this.streamId_;
  }

  unpublish() {
    if (this.pc_) {
      this.pc_.close();
      this.pc_ = null;
    }
  }

  mute(type) {
    if (type === "audio") {
      this.mediaStream_.getAudioTracks().forEach(function (e) {
        e.enabled = false;
      });
      let request = { action: "publish_muteOrUnmute", streamId: this.streamId_, muted : true, type: "audio"};
      this.signaling_.send(JSON.stringify(request));
    }
    else if (type === "video") {
      this.mediaStream_.getVideoTracks().forEach(function (e) {
        e.enabled = false;
      });
      let request = { action: "publish_muteOrUnmute", streamId: this.streamId_, muted : true, type: "video"};
      this.signaling_.send(JSON.stringify(request));
    }
    else
      throw "Invalid type";
  }

  unmute(type) {
    if (type === "audio") {
      this.mediaStream_.getAudioTracks().forEach(function (e) {
        e.enabled = true;
      });
      let request = { action: "publish_muteOrUnmute", streamId: this.streamId_, muted : false, type: "audio"};
      this.signaling_.send(JSON.stringify(request));
    }
    else if (type === "video") {
      this.mediaStream_.getVideoTracks().forEach(function (e) {
        e.enabled = true;
      });
      let request = { action: "publish_muteOrUnmute", streamId: this.streamId_, muted : false, type: "video"};
      this.signaling_.send(JSON.stringify(request));
    }
    else
      throw "Invalid type";
  }
  
  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getStats
   */
  async getStats() {
    if (this.pc_) {
      return this.pc_.getStats();
    } else {
      throw "PeerConnection is null";
    }
  }
};