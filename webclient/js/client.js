class Client extends EventDispatcher {
  constructor(signallingServerIp, signallingServerPort) {
    super();
    this.signaling = new Signaling();
    this.signallingServerIp = signallingServerIp;
    this.signallingServerPort = signallingServerPort;
    this.participantId_ = '';
    this.joined_ = false;
  }

  async join(roomId, participantId) {
    if (this.joined_)
      throw "Already joined meeting.";
    let signalingUrl = "wss://" + inputIp.value + ":" + inputPort.value;
    this.signaling.addEventListener("onsignaling", (e) => {
      let notification = JSON.parse(e);
      if (notification.type === "streamAdded" || notification.type === "participantJoined" || notification.type === "participantLeft")
        super.dispatchEvent(notification.type, notification.data);
      if (notification.type === "signalingDisconnected")
        this.leave();
    });
    await this.signaling.open(signalingUrl);
    let request = { action: "join", roomId: roomId, participantId: participantId };
    let res = await this.signaling.sendRequest(request);
    if (res.error != undefined && res.error)
      throw "Join room failed.";
    this.participantId_ = participantId;
    this.joined_ = true;
    return res.roomInfo;
  }

  leave() {
    if (this.joined_) {
      this.joined_ = false;
      this.signaling.close();
    }
  }

  CreateSubscribeStream() {
    let subscriber = new SubscribeStream(this.signaling);
    return subscriber;
  }

  CreatePublisheStream() {
    let publisher = new PublisheStream(this.signaling);
    return publisher;
  }
};