import Dispatcher from "../dispatcher.jsx";
import navigator from "../navigator.jsx";
import DishPickStore from "../stores/DishPick.jsx"

export var pickDish = function(id) {
  var returnTo = DishPickStore.getReturnTo()
  if(returnTo) {
    navigator.navigate(returnTo)
  }
  else {
    navigator.back()
  }
  console.log('dispt')
  Dispatcher.dispatch({
    eventName: "dishPicker.picked",
    id: id
  })
  console.log('disptched')
}

export var display = function(returnTo) {
  navigator.navigate('/calc/pick')
  Dispatcher.dispatch({
    eventName: "dishPicker.display",
    returnTo
  })
}