var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";

class SettingsStore extends EventEmitter {
  constructor() {
    super();
    this.settings = null;
    this.defaults = {
      'dish_order': 'title:asc',
      carbs_per_bu: 12
    }
    Dispatcher.register(this.dispatch.bind(this));
  }
  getSettings() {
    if(this.settings === null) {
      // not fetched
      return null
    }
    let settings = Object.assign({}, this.defaults, this.settings)
    return settings
  }
  getSetting(key) {
    if(!this.settings) {
      return null;
    }
    if(!this.settings.hasOwnProperty(key)) {
      if(key in this.defaults) {
        return this.defaults[key]
      }
      return null
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