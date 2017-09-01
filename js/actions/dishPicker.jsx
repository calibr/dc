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
  Dispatcher.dispatch({
    eventName: "dishPicker.picked",
    id: id
  })
}

export var display = function(opts) {
  opts = opts || {}
  opts.view = opts.view || 'calc'
  navigator.navigate('/' + opts.view + '/pick')
  Dispatcher.dispatch({
    eventName: "dishPicker.display",
    returnTo: opts.returnTo,
    tag: opts.tag
  })
}