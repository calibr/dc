var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";

class UserStore extends EventEmitter {
  constructor() {
    super();
    this.auth = false
    this.user = null
    Dispatcher.register(this.dispatch.bind(this));
  }
  populate({auth, user}) {
    this.auth = auth
    this.user = user
  }
  dispatch(payload) {
    if(payload.eventName === "user.init") {
      this.user = payload.user
      this.auth = payload.auth
      this.initialized = true
      this.emit("change")
    }
  }
}

export default new UserStore;