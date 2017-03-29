var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";

class MealStore extends EventEmitter {
  constructor() {
    super()
    this._byId = {}
    this.activeMeal = undefined
    this.dispatchToken = Dispatcher.register(this.dispatch.bind(this))
  }
  _add(meal) {
    this._byId[meal.id] = meal
  }
  getById(id) {
    return this._byId[id]
  }
  getActive() {
    return this.activeMeal
  }
  dispatch(payload) {
    if(payload.eventName === "meals.create") {
      this.activeMeal = payload.meal;
      this._add(payload.meal)
      this.emit("change");
    }
    else if(payload.eventName === "meals.update") {
      this._add(payload.meal)
      if(this.activeMeal && this.activeMeal.id == payload.meal.id) {
        this.activeMeal = payload.meal
      }
      this.emit("change")
    }
    else if(payload.eventName === "meals.active-fetch") {
      this.activeMeal = payload.meal
      this._add(payload.meal)
      this.emit("change")
    }
    else if(payload.eventName === "meals.end") {
      this.activeMeal = undefined
      // TODO need to find active meal and update its state
      this.emit("change")
    }
    else if(payload.eventName === "meals.list") {
      // check if servings are returned in meals response
      let anyMealsAdded = false
      for(let meal of payload.meals) {
        anyMealsAdded = true
        let mealToStore = {}
        // copy everything except servings
        for(let k in meal) {
          if(k === "servings") {
            continue
          }
          mealToStore[k] = meal[k]
        }
        this._add(mealToStore)
      }
      if(anyMealsAdded) {
        this.emit('change')
      }
    }
  }
}

export default new MealStore;