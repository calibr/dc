var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";

class SettingsStore extends EventEmitter {
  constructor() {
    super();
    this.settings = null;
    Dispatcher.register(this.dispatch.bind(this));
  }
  getSettings() {
    return this.settings;
  }
  getSetting(key) {
    if(!this.settings) {
      return null;
    }
    if(!this.settings.hasOwnProperty(key)) {
      return null;
    }
    return this.settings[key];
  }
  dispatch(payload) {
    if(payload.eventName === "settings.list") {
      this.settings = payload.settings;
      this.emit("change");
    }
    if(payload.eventName === "settings.set") {
      this.settings = payload.settings;
      this.emit("change", {name: payload.name});
    }
    if(payload.eventName === "settings.delete") {
      this.settings = payload.settings;
      this.emit("change", {name: payload.name});
    }
  }
}

export default new SettingsStore;