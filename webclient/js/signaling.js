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
}
