class Signaling extends EventDispatcher {
  constructor() {
    super();
    this.promisePool = {};
    this.wss = null;
    this.keepAliveTimerId = undefined;
  }

  open(url) {
    var classThis = this;
    return new Promise((resolve, reject) => {
      this.wss = new WebSocket(url);
      this.wss.onopen = (e) => {
        resolve();
        classThis._keepAlive();
      };
      this.wss.onerror = (e) => {
        reject(e);
      }

      this.wss.onclose = (e) => {
        let notification = {type: "signalingDisconnected"};
        super.dispatchEvent("onsignaling", JSON.stringify(notification));
      }

      this.wss.onmessage = (e) => {
        let data = JSON.parse(e.data);
        if (data.transactionId === undefined) {
          super.dispatchEvent("onsignaling", e.data);
        }
        else {
          if (this.promisePool.hasOwnProperty(data.transactionId)) {
            const transactionId = data.transactionId;
            const req = this.promisePool[data.transactionId];
            delete data.transactionId;
            req.resolve(data);
            delete this.promisePool[transactionId];
          }
        }
      };
    });
  }

  close() {
    this._cancelKeepAlive();
    if (this.wss != null)
      this.wss.close();
    this.wss = null;
  }

  send(msg) {
    this.wss.send(msg);
  }

  sendRequest(msg) {
    var transactionId = '';
    while (true) {
      transactionId = Math.round(Math.random() * 1000000000000000000) + '';
      if (!this.promisePool.hasOwnProperty(transactionId))
        break;
    }
    msg.transactionId = transactionId;
    return new Promise((resolve, reject) => {
      this.promisePool[msg.transactionId] = {
        resolve,
        reject
      };
      this.wss.send(JSON.stringify(msg));
    });
  }

  _keepAlive() {
    var timeout = 1000;
    if (this.wss.readyState == this.wss.OPEN) {
      var request = { action: "keepAlive" };
      this.wss.send(JSON.stringify(request));
    }  
    this.keepAliveTimerId = setTimeout(this._keepAlive.bind(this), timeout);
  }

  _cancelKeepAlive() {
    if (this.keepAliveTimerId) {
      clearTimeout(this.keepAliveTimerId);
    }
  }
}
