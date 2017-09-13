import Dispatcher from "../dispatcher.jsx"
import {display as displayDishPickerOrig} from './dishPicker.jsx'
import UUID from 'uuid'
import navigator from "../navigator.jsx"

export var displayDishPicker = function() {
  let tag = UUID.v4()
  Dispatcher.dispatch({
    eventName: 'addServing.pickDish',
    tag
  })
  displayDishPickerOrig({
    tag: tag,
    returnTo: '/calc/servings/add'
  })
}

export var unitChange = function(unit) {
  Dispatcher.dispatch({
    eventName: 'addServing.unitChange',
    unit
  })
}

export var weightChange = function(weight) {
  Dispatcher.dispatch({
    eventName: 'addServing.weightChange',
    weight
  })
}

export var weightBuChange = function(weightBu) {
  Dispatcher.dispatch({
    eventName: 'addServing.weightBuChange',
    weightBu
  })
}

export var display = function(id) {
  Dispatcher.dispatch({
    eventName: 'addServing.display',
    id
  })
  let url = "/calc/servings/"
  if(id)  {
    url += id
  }
  else {
    url += 'add'
  }
  navigator.navigate(url)
}