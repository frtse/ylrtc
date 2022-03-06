import EventDispatcher from "./eventDispatcher"
import Signaling from "./signaling"
import PublisheStream from "./publisheStream"
import SubscribeStream from "./subscribeStream"

export default class Client extends EventDispatcher {
  private signaling_: any;
  private signallingServerIp_: any;
  private signallingServerPort_: any;
  private participantId_: any;
  private joined_: any;
  private mediaStream_: any;
  private roomId_: string;
  constructor(signallingServerIp, signallingServerPort) {
    super();
    this.signaling_ = new Signaling();
    this.signallingServerIp_ = signallingServerIp;
    this.signallingServerPort_ = signallingServerPort;
    this.participantId_ = "";
    this.joined_ = false;
    this.mediaStream_ = null;
    this.roomId_ = "";
  }

  async join(roomId: string, participantId: string) {
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
    this.roomId_ = roomId;
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
    let pc = new RTCPeerConnection({bundlePolicy: "max-bundle", rtcpMuxPolicy: "require"});

    if (mediaStream.getAudioTracks().length >
      0) {
      let init = null;
      if (audioRtpEncodingParameters !== null) {
        init =  {
          direction: 'sendonly',
          sendEncodings: audioRtpEncodingParameters,
          streams: [mediaStream]
        };
      } else {
        init =  {
          direction: 'sendonly',
          streams: [mediaStream]
        };
      }
      pc.addTransceiver(
        mediaStream.getAudioTracks()[0], init
        );
    }
    if (mediaStream.getVideoTracks().length >
      0) {
      let init = null;
      if (videoRtpEncodingParameters !== null) {
        if (Array.isArray(videoRtpEncodingParameters)) {
          if (videoRtpEncodingParameters.length != 1) {
            for(let i = 0; i < videoRtpEncodingParameters.length; i++) {
              if (typeof videoRtpEncodingParameters[i] === 'object' 
                && videoRtpEncodingParameters[i] !== null)
                videoRtpEncodingParameters[i]["rid"] = i + 1  + "";
            }
          }
        }
        init =  {
          direction: 'sendonly',
          sendEncodings: videoRtpEncodingParameters,
          streams: [mediaStream]
        };
      } else {
        init =  {
          direction: 'sendonly',
          streams: [mediaStream]
        };
      }
      let transceiver = pc.addTransceiver(
        mediaStream.getVideoTracks()[0],
        init);
      }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    var request = { action: "publish", offer: offer.sdp };
    let res = await this.signaling_.sendRequest(request);
    if (res.error)
      throw "Publish failed.";
    var answerSdp = new RTCSessionDescription({sdp: res.answer, type: 'answer'});
    let streamId = res.streamId;
    await pc.setRemoteDescription(answerSdp);
    return new PublisheStream(mediaStream, streamId, pc, this.signaling_);
  }

  async subscribe(remoteStream) {
    this.mediaStream_ = null;
    this.mediaStream_ = new MediaStream();
    let pc = new RTCPeerConnection({bundlePolicy: "max-bundle", rtcpMuxPolicy: "require"});
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
    var answerSdp = new RTCSessionDescription({sdp: res.answer, type: 'answer'});
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
    this.mediaStream_.addTrack(e.track);
  }
};