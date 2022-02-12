export default class EventDispatcher {
  private events_: any;
  constructor() {
    this.events_ = {};
  }

  addEventListener(event: string, callback) {
    if (typeof callback !== 'function') {
      console.error(`The listener callback must be a function, the given type is ${typeof callback}`);
      return false;
    }

    if (this.events_[event] === undefined) {
      this.events_[event] = {
        listeners: []
      }
    }

    this.events_[event].listeners.push(callback);
  }

  removeEventListener(event: string, callback) {
    if (this.events_[event] === undefined) {
      console.error(`This event: ${event} does not exist`);
      return false;
    }

    this.events_[event].listeners = this.events_[event].listeners.filter(listener => {
      return listener.toString() !== callback.toString();
    });
  }

  dispatchEvent(event: string, details) {
    if (this.events_[event] === undefined) {
      return false;
    }

    this.events_[event].listeners.forEach((listener) => {
      listener(details);
    });
  }
}