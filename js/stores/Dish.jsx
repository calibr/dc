var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";
import XRegExp from 'xregexp'
import SimpleIndex from '../util/SimpleIndex.jsx'

class DishStore extends EventEmitter {
  dishes: null;
  // not deleted dishes
  dishesActive: null;
  constructor() {
    super();
    this.order = ["carbs", "asc"];
    this.idMap = new Map()
    this.wordSplitRegExp = new XRegExp('\W+')
    this.wordsIndex = new SimpleIndex()
    Dispatcher.register(this.dispatch.bind(this));
  }
  _prepare(dish) {
    dish.carbsInt = parseInt(dish.carbs)
    return dish
  }
  _addDish(dish) {
    this.dishes.push(dish)
    this.idMap.set(dish.id, dish)
    if(!dish.deleted) {
      this.dishesActive.push(this._prepare(dish))
    }
  }
  _updateDish(dish) {
    for(let i = 0; i != this.dishes.length; i++) {
      if(this.dishes[i].id == dish.id) {
        this.dishes[i] = this._prepare(dish);
        break;
      }
    }
    this.idMap.set(dish.id, dish)
  }
  _clearDishes() {
    this.idMap.clear()
    this.dishes = []
    this.dishesActive = []
  }
  getDishes() {
    return this.dishes;
  }
  getDishesActive() {
    return this.dishesActive;
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
      this._clearDishes()
      for(let dish of payload.dishes) {
        this._addDish(dish)
      }
      this.emit("change");
    }
    else if(payload.eventName === "dishes.added") {
      this._addDish(payload.dish)
      this.emit("added", {
        tag: payload.tag
      });
      this.emit("change");
    }
    else if(payload.eventName === "dishes.updated") {
      this._updateDish(payload.dish)
      this.emit("change");
    }
    else if(payload.eventName === "dishes.deleted") {
      let index = -1
      // remove from active dishes
      for(let i = 0; i != this.dishesActive.length; i++) {
        if(this.dishesActive[i].id == payload.id) {
          index = i
          break;
        }
      }
      if(index >= 0) {
        this.dishesActive.splice(index, 1)
      }
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