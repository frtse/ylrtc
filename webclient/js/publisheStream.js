class PublisheStream {
  constructor(signaling) {
    this.mediaStream_ = null;
    this.streamId_ = '';
    this.pc_ = null;
    this.signaling_ = signaling;
  }

  Id() {
    return this.streamId_;
  }

  async publish(device) {
    this.mediaStream_ = device.mediaStream();
    const configuration = {};
    this.pc_ = new RTCPeerConnection(configuration);

    const transceiverInit = {
      direction: 'sendonly',
      streams: [this.mediaStream_]
    };

    if (this.mediaStream_.getAudioTracks().length >
      0) {
      this.pc_.addTransceiver(
        this.mediaStream_.getAudioTracks()[0],
          transceiverInit);
    }
    if (this.mediaStream_.getVideoTracks().length >
      0) {
      this.pc_.addTransceiver(
        this.mediaStream_.getVideoTracks()[0],
          transceiverInit);
    }

    const offer = await this.pc_.createOffer();
    await this.pc_.setLocalDescription(offer);
    var request = { action: "publish", offer: offer.sdp };
    let res = await this.signaling_.sendRequest(request);
    if (res.error)
      throw "Publish failed.";
    var answerSdp = new RTCSessionDescription();
    answerSdp.sdp = res.answer;
    answerSdp.type = 'answer';
    this.streamId_ = res.streamId;
    await this.pc_.setRemoteDescription(answerSdp);
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
      this.signaling_.send(request);
    }
    else if (type === "video") {
      this.mediaStream_.getVideoTracks().forEach(function (e) {
        e.enabled = false;
      });
      let request = { action: "publish_muteOrUnmute", streamId: this.streamId_, muted : true, type: "video"};
      this.signaling_.send(request);
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
      this.signaling_.send(request);
    }
    else if (type === "video") {
      this.mediaStream_.getVideoTracks().forEach(function (e) {
        e.enabled = true;
      });
      let request = { action: "publish_muteOrUnmute", streamId: this.streamId_, muted : false, type: "video"};
      this.signaling_.send(request);
    }
    else
      throw "Invalid type";
  }
};