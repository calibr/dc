var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";

class DishPickStore extends EventEmitter {
  constructor() {
    super();
    this.returnTo = null
    this.dishId = null
    Dispatcher.register(this.dispatch.bind(this));
  }
  getReturnTo() {
    return this.returnTo;
  }
  getDishId() {
    return this.dishId;
  }
  dispatch(payload) {
    if(payload.eventName === "dishPicker.display") {
      this.returnTo = payload.returnTo
      this.emit("display");
    }
    else if(payload.eventName === "dishPicker.picked") {
      this.dishId = payload.id
      this.emit("pick", payload.id);
    }
  }
}

export default new DishPickStore;