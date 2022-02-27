import EventDispatcher from "./eventDispatcher"

export default class SubscribeStream extends EventDispatcher {
  private signaling_: any;
  private pc_: any;
  private subscribeStreamId_: any;
  private publishStreamId_: any;
  private mediaStream_: any;
  constructor(signaling, pc, subscribeStreamId, publishStreamId, mediaStream) {
    super();
    this.signaling_ = signaling;
    this.signaling_.addEventListener("onsignaling", (e) => {
      let notification = JSON.parse(e);
      if (notification.type === "publishMuteOrUnmute") {
        if (notification.data.publishStreamId === this.publishStreamId_) {
          let eventType = notification.data.muted ? 'mute' : 'unmute';
          super.dispatchEvent(eventType, notification.data.type);
        }
      }
    });
    this.signaling_.addEventListener("onsignaling", (e) => {
      let notification = JSON.parse(e);
      if (notification.type === "streamRemoved") {
        if (notification.data.publishStreamId === this.publishStreamId_) {
          this.close();
          super.dispatchEvent("ended", this.subscribeStreamId_);
        }
      }
    });
    this.pc_ = pc;
    this.subscribeStreamId_ = subscribeStreamId;
    this.publishStreamId_ = publishStreamId;
    this.mediaStream_ = mediaStream;
  }

  id() {
    return this.subscribeStreamId_;
  }

  mediaStream() {
    return this.mediaStream_;
  }

  close() {
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

  async switchToSimulcastLayer(layer: string) {
    let layer_num = parseInt(layer);
    if (layer_num < 1)
      throw "Invalid layer.";
    let request = { action: "ChangeSimulcastLayer", subscribeStreamId: this.subscribeStreamId_, simulcastLayer: layer};
    let res = await this.signaling_.sendRequest(request);
    if (res.error != undefined && res.error)
      throw "Set simulcast layer failed.";
  }
};