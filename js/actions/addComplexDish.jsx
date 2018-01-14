import Dispatcher from "../dispatcher.jsx"
//import {display as displayDishPickerOrig} from './dishPicker.jsx'
import navigator from "../navigator.jsx"
import {display as displayDishPickerOrig} from './dishPicker.jsx'
import UUID from 'uuid'

export var displayDishPicker = function(subDishUuid) {
  let tag = UUID.v4()
  Dispatcher.dispatch({
    eventName: 'addComplexDish.pickDish',
    tag,
    subDishUuid
  })
  displayDishPickerOrig({
    view: 'dishes',
    tag: tag,
    returnTo: '/dishes/addComplex'
  })
}

export function addSubDish() {
  Dispatcher.dispatch({
    eventName: 'addComplexDish.addSubDish'
  })
}

export function display() {
  Dispatcher.dispatch({
    eventName: 'addComplexDish.display'
  })
}

export function changeSubDish(subdish) {
  Dispatcher.dispatch({
    eventName: 'addComplexDish.changeSubDish',
    subdish
  })
}

export function deleteSubDish(uuid) {
  Dispatcher.dispatch({
    eventName: 'addComplexDish.deleteSubDish',
    uuid
  })
}

export function changeTitle(title) {
  Dispatcher.dispatch({
    eventName: 'addComplexDish.changeTitle',
    title
  })
}

export function changeTotalWeight(value) {
  Dispatcher.dispatch({
    eventName: 'addComplexDish.changeTotalWeight',
    value
  })
}