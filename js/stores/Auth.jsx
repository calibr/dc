var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";

class AuthStore extends EventEmitter {
  constructor() {
    super();
    this.registerError = null
    this.authError = null
    this.loginInProgress = false
    this.registerInProgress = false
    Dispatcher.register(this.dispatch.bind(this));
  }
  populate({auth, user}) {
    this.auth = auth
    this.user = user
  }
  dispatch(payload) {
    if(payload.eventName === "auth.registerFailed") {
      this.registerInProgress = false
      this.registerError = {
        text: payload.error,
        code: payload.errorCode
      }
      this.emit("change")
    }
    else if(payload.eventName === "auth.loginFailed") {
      this.loginInProgress = false
      this.loginError = {
        text: payload.error,
        code: payload.errorCode
      }
      this.emit("change")
    }
    else if(payload.eventName === "auth.clearErrors") {
      this.loginError = null
      this.registerError = null
      this.emit("change")
    }
    else if(payload.eventName === "auth.loginInProgress") {
      this.loginInProgress = true
      this.emit("change")
    }
    else if(payload.eventName === "auth.registerInProgress") {
      this.registerInProgress = true
      this.emit("change")
    }
    else if(payload.eventName === "user.init") {
      this.loginInProgress = false
      this.registerInProgress = false
      this.emit("change")
    }
  }
}

export default new AuthStore;