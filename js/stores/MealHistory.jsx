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
    if(this.mealsIds.indexOf(mealId) >= 0) {
      return false
    }
    this.mealsIds.push(mealId)
    return true
  }
  countMeals() {
    return this.mealsIds ? this.mealsIds.length : 0
  }
  getIds() {
    if(this.mealsIds) {
      return this.mealsIds.slice()
    }
    return this.mealsIds
  }
  dispatch(payload) {
    if(payload.eventName === 'meals.list') {
      Dispatcher.waitFor([Meal.dispatchToken, Serving.dispatchToken])
      let countCurrentMeals = this.mealsIds ? this.mealsIds.length : 0
      if(payload.offset === countCurrentMeals) {
        let anyMealsAdded = false
        for(let meal of payload.meals) {
          if(this._add(meal.id)) {
            anyMealsAdded = true
          }
        }
        if(typeof this.mealsIds === 'undefined') {
          // the first fetch with empty history
          this.mealsIds = []
        }
        // still need to call change even if no meals were added, we need to notifiy views that request completed
        this.emit('change', {tag: payload.tag, anyMealsAdded})
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