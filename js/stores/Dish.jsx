var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";

class DishStore extends EventEmitter {
  dishes: null;
  constructor() {
    super();
    this.order = ["carbs", "asc"];
    Dispatcher.register(this.dispatch.bind(this));
  }
  getDishes() {
    return this.dishes;
  }
  getOrder() {
    return this.order;
  }
  getById(id) {
    if(!this.dishes) {
      return null;
    }
    for(let dish of this.dishes) {
      if(dish.id == id) {
        return dish;
      }
    }
    return null;
  }
  dispatch(payload) {
    if(payload.eventName === "dishes.list") {
      this.dishes = payload.dishes;
      this.emit("change");
    }
    else if(payload.eventName === "dishes.added") {
      this.dishes.push(payload.dish);
      this.emit("added", {
        tag: payload.tag
      });
      this.emit("change");
    }
    else if(payload.eventName === "dishes.updated") {
      for(let i = 0; i != this.dishes.length; i++) {
        if(this.dishes[i].id == payload.dish.id) {
          this.dishes[i] = payload.dish;
          break;
        }
      }
      this.emit("change");
    }
    else if(payload.eventName === "dishes.setOrder") {
      this.order = payload.order;
      this.emit("change-order");
    }
  }
}

export default new DishStore;