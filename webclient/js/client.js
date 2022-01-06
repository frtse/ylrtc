class Client extends EventDispatcher {
  constructor(signallingServerIp, signallingServerPort) {
    super();
    this.signaling_ = new Signaling();
    this.signallingServerIp_ = signallingServerIp;
    this.signallingServerPort_ = signallingServerPort;
    this.participantId_ = '';
    this.joined_ = false;
    this.mediaStream_ = null;
  }

  async join(roomId, participantId) {
    if (this.joined_)
      throw "Already joined meeting.";
    let signalingUrl = "wss://" + this.signallingServerIp_ + ":" + this.signallingServerPort_;
    this.signaling_.addEventListener("onsignaling", (e) => {
      let notification = JSON.parse(e);
      if (notification.type === "streamAdded" || notification.type === "participantJoined" || notification.type === "participantLeft")
        super.dispatchEvent(notification.type, notification.data);
      if (notification.type === "signalingDisconnected")
        this.leave();
    });
    await this.signaling_.open(signalingUrl);
    let request = { action: "join", roomId: roomId, participantId: participantId };
    let res = await this.signaling_.sendRequest(request);
    if (res.error != undefined && res.error)
      throw "Join room failed.";
    this.participantId_ = participantId;
    this.joined_ = true;
    return res.roomInfo;
  }

  /**
   * Publish stream.
   * @param {*} device Device
   * @param {*} videoRtpEncodingParameters RTCRtpEncodingParameters https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpEncodingParameters
   * @param {*} audioRtpEncodingParameters RTCRtpEncodingParameters https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpEncodingParameters
   */
  async publish(device, audioRtpEncodingParameters, videoRtpEncodingParameters) {
    let mediaStream = device.mediaStream();
    const configuration = {bundlePolicy: "max-bundle"};
    let pc = new RTCPeerConnection(configuration);

    const audioTransceiverInit = {
      direction: 'sendonly',
      sendEncodings: [{rid: 'q', active: true, maxBitrate: 64000}],
      streams: [mediaStream]
    };

    if (audioRtpEncodingParameters !== null)
      audioTransceiverInit.sendEncodings = audioRtpEncodingParameters;

    const videoTransceiverInit = {
      direction: 'sendonly',
      sendEncodings: [{rid: 'q', active: true, maxBitrate: 200000}],
      streams: [mediaStream]
    };

    if (videoRtpEncodingParameters !== null)
      videoTransceiverInit.sendEncodings = videoRtpEncodingParameters;

    if (mediaStream.getAudioTracks().length >
      0) {
      pc.addTransceiver(
        mediaStream.getAudioTracks()[0],
        audioTransceiverInit);
    }
    if (mediaStream.getVideoTracks().length >
      0) {
      pc.addTransceiver(
        mediaStream.getVideoTracks()[0],
        videoTransceiverInit);
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    var request = { action: "publish", offer: offer.sdp };
    let res = await this.signaling_.sendRequest(request);
    if (res.error)
      throw "Publish failed.";
    var answerSdp = new RTCSessionDescription();
    answerSdp.sdp = res.answer;
    answerSdp.type = 'answer';
    let streamId = res.streamId;
    await pc.setRemoteDescription(answerSdp);
    return new PublisheStream(mediaStream, streamId, pc, this.signaling_);
  }

  async subscribe(remoteStream) {
    const configuration = {bundlePolicy: "max-bundle"};
    let pc = new RTCPeerConnection(configuration);
    if (remoteStream.hasAudio)
      pc.addTransceiver("audio", { direction: "recvonly" });
    if (remoteStream.hasVideo)
      pc.addTransceiver("video", { direction: "recvonly" });
    pc.ontrack = this._ontrack.bind(this);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    let request = { action: "subscribe", streamId: remoteStream.publishStreamId, participantId: remoteStream.participantId, offer: offer.sdp };
    let res = await this.signaling_.sendRequest(request);

    if (res.error)
      throw "Connect failed.";
    var answerSdp = new RTCSessionDescription();
    answerSdp.sdp = res.answer;
    answerSdp.type = 'answer';
    await pc.setRemoteDescription(answerSdp);
    let subscribeStreamId = res.streamId;
    let publishStreamId = remoteStream.publishStreamId;
    return new SubscribeStream(this.signaling_, pc, subscribeStreamId, publishStreamId, this.mediaStream_);
  }

  leave() {
    if (this.joined_) {
      this.joined_ = false;
      this.signaling_.close();
    }
  }

  _ontrack(e) {
    this.mediaStream_ = null;
    this.mediaStream_ = new MediaStream();
    this.mediaStream_.addTrack(e.track);
  }
};