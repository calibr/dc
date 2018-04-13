var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";

class ServingStore extends EventEmitter {
  constructor() {
    super();
    this.byMeal = {};
    this.byId = {};
    this.dispatchToken = Dispatcher.register(this.dispatch.bind(this));
  }
  getForMeal(mealId) {
    if(!this.byMeal[mealId]) {
      return null;
    }
    return this.byMeal[mealId].map(servingId => {
      return this.byId[servingId];
    });
  }
  getById(servingId) {
    return this.byId[servingId];
  }
  _add(serving) {
    if(!this.byMeal[serving.meal_id]) {
      this.byMeal[serving.meal_id] = [];
    }
    if(this.byMeal[serving.meal_id].indexOf(serving.id) < 0) {
      this.byMeal[serving.meal_id].push(serving.id);
    }
    this.byId[serving.id] = serving;
  }
  _delete(id) {
    delete this.byId[id];
    for(let mealId in this.byMeal) {
      let index = this.byMeal[mealId].indexOf(id);
      if(index >= 0) {
        this.byMeal[mealId].splice(index, 1);
      }
    }
  }
  dispatch(payload) {
    if(payload.eventName === "servings.added") {
      this._add(payload.serving);
      this.emit("change", {tag: payload.tag});
    }
    else if(payload.eventName === "servings.updated") {
      this._add(payload.serving);
      this.emit("change");
    }
    else if(payload.eventName === "servings.deleted") {
      var id = payload.id;
      this._delete(id);
      this.emit("change");
    }
    else if(payload.eventName === "servings.list") {
      for(let serving of payload.servings) {
        this._add(serving);
      }
      if(payload.params && payload.params.meal_id && !payload.servings.length) {
        // need to set empty list of servings for the meal, because something is waiting for the answer
        this.byMeal[payload.params.meal_id] = [];
      }
      this.emit("change");
    }
    else if(payload.eventName === "meals.list") {
      // check if servings are returned in meals response
      let anyServingAdded = false
      for(let meal of payload.meals) {
        if(meal.servings && Array.isArray(meal.servings)) {
          for(let serving of meal.servings) {
            anyServingAdded = true
            this._add(serving)
          }
        }
      }
      if(anyServingAdded) {
        this.emit('change')
      }
    }
  }
}

export default new ServingStore;