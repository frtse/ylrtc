class SubscribeStream extends EventDispatcher {
  constructor(signaling) {
    super();
    this.signaling_ = signaling;
    this.signaling_.addEventListener("onsignaling", (e) => {
      let notification = JSON.parse(e);
      if (notification.type === "publishMuteOrUnmute") {
        if (notification.data.publishStreamId === this.publishStreamId_) {
          let eventType = notification.data.muted ? 'mute' : 'unmute';
          super.dispatchEvent(eventType, notification.type);
        }
      }
    });
    this.signaling_.addEventListener("onsignaling", (e) => {
      let notification = JSON.parse(e);
      if (notification.type === "streamRemoved") {
        if (notification.data.publishStreamId === this.publishStreamId_) {
          super.dispatchEvent("ended", this.subscribeStreamId_);
        }
      }
    });
    this.pc_ = null;
    this.subscribeStreamId_ = '';
    this.publishStreamId_ = '';
    this.mediaStream_ = new MediaStream();
  }

  Id() {
    return this.subscribeStreamId_;
  }

  async subscribe(remoteStream) {
    const configuration = {bundlePolicy: "max-bundle"};
    this.pc_ = new RTCPeerConnection(configuration);
    if (remoteStream.hasAudio)
      this.pc_.addTransceiver("audio", { direction: "recvonly" });
    if (remoteStream.hasVideo)
      this.pc_.addTransceiver("video", { direction: "recvonly" });
    this.pc_.ontrack = this._ontrack.bind(this);
    const offer = await this.pc_.createOffer();
    await this.pc_.setLocalDescription(offer);

    let request = { action: "subscribe", streamId: remoteStream.publishStreamId, participantId: remoteStream.participantId, offer: offer.sdp };
    let res = await this.signaling_.sendRequest(request);

    if (res.error)
      throw "Connect failed.";
    var answerSdp = new RTCSessionDescription();
    answerSdp.sdp = res.answer;
    answerSdp.type = 'answer';
    await this.pc_.setRemoteDescription(answerSdp);
    this.subscribeStreamId_ = res.streamId;
    this.publishStreamId_ = remoteStream.publishStreamId;
    return this.mediaStream_;
  }

  unsubscribe() {
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
    }
    else if (type === "video") {
      this.mediaStream_.getVideoTracks().forEach(function (e) {
        e.enabled = false;
      });
    }
    else
      throw "Invalid type";
  }

  unmute(type) {
    if (type === "audio") {
      this.mediaStream_.getAudioTracks().forEach(function (e) {
        e.enabled = true;
      });
    }
    else if (type === "video") {
      this.mediaStream_.getVideoTracks().forEach(function (e) {
        e.enabled = true;
      });
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

  _ontrack(e) {
    //https://webrtc.org/getting-started/remote-streams
    this.mediaStream_.addTrack(e.track);
  }
};