var EventEmitter = require("events")
import Meal from './Meal.jsx'
import Serving from './Serving.jsx'
import Dispatcher from "../dispatcher.jsx"

class MealHistoryStore extends EventEmitter {
  constructor() {
    super()
    this.mealsIds = undefined
    Dispatcher.register(this.dispatch.bind(this))
  }
  _add(mealId) {
    if(!this.mealsIds) {
      this.mealsIds = []
    }
    this.mealsIds.push(mealId)
  }
  getIds() {
    return this.mealsIds
  }
  dispatch(payload) {
    if(payload.eventName === 'meals.list') {
      Dispatcher.waitFor([Meal.dispatchToken, Serving.dispatchToken])
      let countCurrentMeals = this.mealsIds ? this.mealsIds.length : 0
      if(payload.offset === countCurrentMeals) {
        let anyMealsAdded = false
        for(let meal of payload.meals) {
          anyMealsAdded = true
          this._add(meal.id)
        }
        if(anyMealsAdded) {
          this.emit('change')
        }
        else {
          if(typeof this.mealsIds === 'undefined') {
            // the first fetch with empty history
            this.mealsIds = []
            this.emit('change')
          }
        }
      }
    }
    else if(payload.eventName === 'meals.end') {
      // need to clear the store
      this.mealsIds = undefined
      this.emit('change')
    }
  }
}

export default new MealHistoryStore;