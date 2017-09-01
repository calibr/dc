var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";

class DishStore extends EventEmitter {
  dishes: null;
  constructor() {
    super();
    this.order = ["carbs", "asc"];
    this.idMap = new Map()
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
    if(typeof id !== 'string') {
      id = id.toString()
    }
    return this.idMap.get(id)
  }
  dispatch(payload) {
    if(payload.eventName === "dishes.list") {
      this.dishes = payload.dishes;
      // rebuild map totally
      this.idMap.clear()
      for(let dish of this.dishes) {
        this.idMap.set(dish.id, dish)
      }
      this.emit("change");
    }
    else if(payload.eventName === "dishes.added") {
      this.dishes.push(payload.dish);
      this.idMap.set(payload.dish.id, payload.dish)
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
      this.idMap.set(payload.dish.id, payload.dish)
      this.emit("change");
    }
    else if(payload.eventName === "dishes.deleted") {
      let index = -1
      for(let i = 0; i != this.dishes.length; i++) {
        if(this.dishes[i].id == payload.id) {
          index = i
          break;
        }
      }
      if(index >= 0) {
        this.dishes.splice(index, 1)
      }
      this.idMap.delete(payload.id)
      this.emit("change");
    }
    else if(payload.eventName === "dishes.setOrder") {
      this.order = payload.order;
      this.emit("change-order");
    }
    // should be in DishPicker store?
    else if(payload.eventName === "dishes.picked") {
      this.emit("pick", payload.id);
    }
  }
}

export default new DishStore;