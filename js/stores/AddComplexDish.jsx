var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";
const uuidV4 = require('uuid/v4');

class AddComplexDish extends EventEmitter {
  dishes: null;
  constructor() {
    super();
    this.reset()
    Dispatcher.register(this.dispatch.bind(this));
  }
  findSubDishByUuid(uuid) {
    for(let i = 0; i != this.subDishes.length; i++) {
      let subDish = this.subDishes[i]
      if(subDish.uuid === uuid) {
        return {
          index: i,
          subDish
        }
      }
    }
    return null
  }
  reset() {
    this.subDishes = []
    //this.dishPickTag = null
    this.totalWeight = ''
    this.title = ''
    this.dishPickTag = ''
    this.dishPickSubDishUuid = ''
  }
  dispatch(payload) {
    if(payload.eventName === 'addComplexDish.addSubDish') {
      this.subDishes.push({
        dishId: undefined,
        weight: '',
        uuid: uuidV4()
      })
      this.emit('change')
    }
    else if(payload.eventName === "dishPicker.picked") {
      if(payload.tag === this.dishPickTag) {
        let {subDish} = this.findSubDishByUuid(this.dishPickSubDishUuid)
        subDish.dishId = payload.id
        this.emit('change')
      }
    }
    else if(payload.eventName === 'addComplexDish.display') {
      this.reset()
    }
    else if(payload.eventName === 'addComplexDish.changeSubDish') {
      let subdish = payload.subdish
      let {index} = this.findSubDishByUuid(subdish.uuid)
      this.subDishes[index] = subdish
      this.emit('change')
    }
    else if(payload.eventName === 'addComplexDish.deleteSubDish') {
      let {index} = this.findSubDishByUuid(payload.uuid)
      this.subDishes.splice(index, 1)
      this.emit('change')
    }
    else if(payload.eventName === 'addComplexDish.pickDish') {
      this.dishPickTag = payload.tag
      this.dishPickSubDishUuid = payload.subDishUuid
    }
    else if(payload.eventName === 'addComplexDish.changeTitle') {
      this.title = payload.title
      this.emit('change')
    }
  }
}

export default new AddComplexDish;