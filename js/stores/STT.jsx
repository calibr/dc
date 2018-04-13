var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";
import XRegExp from 'xregexp'
import SimpleIndex from '../util/SimpleIndex.jsx'

class STTStore extends EventEmitter {
  constructor() {
    super();
    this.results = new Map()
    this.visible = false
    Dispatcher.register(this.dispatch.bind(this));
  }
  dispatch(payload) {
    if(payload.eventName === "stt.keywordsToDishes") {
      this.results.set(payload.reqId, payload.data)
      this.emit("change");
    }
    else if(payload.eventName === "stt.dialogStateChange") {
      this.visible = payload.visible
      this.emit("visibilityChange");
    }
  }
}

export default new STTStore;