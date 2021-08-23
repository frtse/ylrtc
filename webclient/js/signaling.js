class Signaling extends EventDispatcher {
  constructor() {
    super();
    this.promisePool = {};
    this.wss = null;
  }

  open(url) {
    return new Promise((resolve, reject) => {
      this.wss = new WebSocket(url);
      this.wss.onopen = (e) => {
        resolve();
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
        if (data.requestId === undefined) {
          super.dispatchEvent("onsignaling", e.data);
        }
        else {
          if (this.promisePool.hasOwnProperty(data.requestId)) {
            const requestId = data.requestId;
            const req = this.promisePool[data.requestId];
            delete data.requestId;
            req.resolve(data);
            delete this.promisePool[requestId];
          }
        }
      };
    });
  }

  close() {
    if (this.wss != null)
      this.wss.close();
    this.wss = null;
  }

  send(msg) {
    this.wss.send(msg);
  }

  sendRequest(msg) {
    var requestId = Math.round(Math.random() * 1000000000000000000) + '';
    msg.requestId = requestId;
    return new Promise((resolve, reject) => {
      this.promisePool[msg.requestId] = {
        resolve,
        reject
      };
      this.wss.send(JSON.stringify(msg));
    });
  }
}
