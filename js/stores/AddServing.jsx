var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";
import DishStore from './Dish.jsx'
import ServingStore from './Serving.jsx'
import {carbsToBu, buToCarbs} from "../util/bu.jsx";
import {getCarbsInServing} from "../util/dishes.jsx";
import {round} from "../util/calc.jsx";

function calcBu(dishId, weight) {
  var dish = DishStore.getById(dishId);
  var carbs = getCarbsInServing(dish, weight);
  return carbsToBu(carbs);
}

function calcWeightByBu(dishId, bu) {
  var dish = DishStore.getById(dishId);
  var carbsin1gram = dish.carbs/100;
  return round(bu * buToCarbs(1)/carbsin1gram);
}

class AddServingStore extends EventEmitter {
  dishes: null;
  constructor() {
    super();
    this.reset()
    Dispatcher.register(this.dispatch.bind(this));
  }
  reset() {
    this.dishId = undefined
    this.dishPickTag = null
    this.weight = ''
    this.weightBu = ''
    this.unit = 'gram'
    this.serving = null
  }
  dispatch(payload) {
    if(payload.eventName === "dishPicker.picked") {
      console.log("Dish picked with tag", payload.tag, payload.tag === this.dishPickTag)
      if(payload.tag === this.dishPickTag) {
        this.dishId = payload.id
        if(this.unit === 'gram' && this.weight) {
          this.weightBu = calcBu(this.dishId, this.weight)
        }
        else if(this.unit === 'bu' && this.weightBu) {
          this.weight = calcWeightByBu(this.dishId, this.weightBu)
        }
        this.emit('change')
      }
    }
    else if(payload.eventName === 'addServing.pickDish') {
      this.dishPickTag = payload.tag
      console.log("Wait for dish to be picked with tag", payload.tag)
    }
    else if(payload.eventName === 'addServing.unitChange') {
      this.unit = payload.unit
      this.emit('change')
    }
    else if(payload.eventName === 'addServing.weightChange') {
      this.weight = payload.weight
      if(this.dishId) {
        this.weightBu = calcBu(this.dishId, this.weight);
      }
      this.emit('change')
    }
    else if(payload.eventName === 'addServing.weightBuChange') {
      this.weightBu = payload.weightBu
      if(this.dishId) {
        this.weight = calcWeightByBu(this.dishId, this.weightBu);
      }
      this.emit('change')
    }
    else if(payload.eventName === 'addServing.display') {
      this.reset()
      if(payload.id) {
        let serving = ServingStore.getById(payload.id)
        this.weight = serving.weight
        this.dishId = serving.dish_id
        this.weightBu = calcBu(this.dishId, this.weight)
        this.serving = serving
      }
    }
  }
}

export default new AddServingStore;