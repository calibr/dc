var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";
import XRegExp from 'xregexp'
import SimpleIndex from '../util/SimpleIndex.jsx'

class STTStore extends EventEmitter {
  constructor() {
    super();
    this.stage = 'nope'
    this.keywordsToDishes = null
    this.tag = null
    this.active = false
    this.result = null
    this.rawText = ''
    this.weight = 0
    this.callback = null
    this.returnTo = null
    Dispatcher.register(this.dispatch.bind(this));
  }
  getReturnTo() {
    return this.returnTo
  }
  dispatch(payload) {
    if(payload.eventName === "stt.keywordsToDishes") {
      let keywords = Object.keys(payload.data)[0]
      if(payload.data[keywords].dishes.length === 0) {
        this.stage = 'notfound'
      }
      else {
        this.keywordsToDishes = payload.data
        this.stage = 'list'
      }
      this.emit("change");
    }
    else if(payload.eventName === "stt.dialogStateChange") {
      this.callback = payload.callback
      this.returnTo = payload.returnTo
      this.emit("change");
    }
    else if(payload.eventName === "stt.start") {
      this.stage = 'speaking'
      this.tag = payload.tag
      this.result = null
      this.noresult = false
      this.active = true
      this.rawText = ''
      this.emit('change')
    }
    else if(payload.eventName === "stt.end" && this.tag === payload.tag) {
      this.active = false
      this.emit('change')
    }
    else if(payload.eventName === "stt.resut" && this.tag === payload.tag) {
      this.stage = 'lookup'
      this.result = payload.result
      this.weight = this.result.weight
      this.emit('change')
    }
    else if(payload.eventName === "stt.noresult" && this.tag === payload.tag) {
      this.stage = 'noresult'
      this.emit('change')
    }
    else if(payload.eventName === "stt.raw" && this.tag === payload.tag) {
      this.rawText = payload.text
      this.emit('change')
    }
    else if(payload.eventName === "stt.weightChange") {
      this.weight = payload.weight
      this.emit('change')
    }
  }
}

export default new STTStore;