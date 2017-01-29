var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";

class MealStore extends EventEmitter {
  constructor() {
    super();
    this.activeMeal = undefined;
    Dispatcher.register(this.dispatch.bind(this));
  }
  getActive() {
    return this.activeMeal;
  }
  dispatch(payload) {
    if(payload.eventName === "meals.create") {
      this.activeMeal = payload.meal;
      this.emit("change");
    }
    else if(payload.eventName === "meals.update") {
      if(this.activeMeal && this.activeMeal.id == payload.meal.id) {
        this.activeMeal = payload.meal;
        this.emit("change");
      }
    }
    else if(payload.eventName === "meals.active-fetch") {
      this.activeMeal = payload.meal;
      this.emit("change");
    }
    else if(payload.eventName === "meals.end") {
      this.activeMeal = undefined;
      this.emit("change");
    }
  }
}

export default new MealStore;