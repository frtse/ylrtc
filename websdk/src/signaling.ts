import EventDispatcher from "./eventDispatcher"

export default class Signaling extends EventDispatcher {
  private promisePool_: any;
  private wss_: any;
  private keepAliveTimerId_: any;
  constructor() {
    super();
    this.promisePool_ = {};
    this.wss_ = null;
    this.keepAliveTimerId_ = undefined;
  }

  open(url: string): Promise<void> {
    var classThis = this;
    return new Promise((resolve, reject) => {
      this.wss_ = new WebSocket(url);
      this.wss_.onopen = (e) => {
        resolve();
        classThis._keepAlive();
      };
      this.wss_.onerror = (e) => {
        reject(e);
      }

      this.wss_.onclose = (e) => {
        let notification = {type: "signalingDisconnected"};
        super.dispatchEvent("onsignaling", JSON.stringify(notification));
      }

      this.wss_.onmessage = (e) => {
        let data = JSON.parse(e.data);
        if (data.transactionId === undefined) {
          super.dispatchEvent("onsignaling", e.data);
        }
        else {
          if (this.promisePool_.hasOwnProperty(data.transactionId)) {
            const transactionId = data.transactionId;
            const req = this.promisePool_[data.transactionId];
            delete data.transactionId;
            req.resolve(data);
            delete this.promisePool_[transactionId];
          }
        }
      };
    });
  }

  close(): void {
    this._cancelKeepAlive();
    if (this.wss_ != null)
      this.wss_.close();
    this.wss_ = null;
  }

  send(msg): void {
    this.wss_.send(msg);
  }

  sendRequest(msg) {
    var transactionId = '';
    while (true) {
      transactionId = Math.round(Math.random() * 1000000000000000000) + '';
      if (!this.promisePool_.hasOwnProperty(transactionId))
        break;
    }
    msg.transactionId = transactionId;
    return new Promise((resolve, reject) => {
      this.promisePool_[msg.transactionId] = {
        resolve,
        reject
      };
      this.wss_.send(JSON.stringify(msg));
    });
  }

  _keepAlive(): void {
    var timeout = 1000;
    if (this.wss_.readyState == this.wss_.OPEN) {
      var request = { action: "keepAlive" };
      this.wss_.send(JSON.stringify(request));
    }  
    this.keepAliveTimerId_ = setTimeout(this._keepAlive.bind(this), timeout);
  }

  _cancelKeepAlive(): void {
    if (this.keepAliveTimerId_) {
      clearTimeout(this.keepAliveTimerId_);
    }
  }
}
