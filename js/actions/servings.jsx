import 'whatwg-fetch'
import Dispatcher from "../dispatcher.jsx";
import {apiFetch} from '../util/fetch.jsx'
import uuid from 'uuid'
import MealStore from '../stores/Meal.jsx'

export var importServings = function(servings) {
  var formData = new FormData();
  for(let i = 0; i != servings.length; i++) {
    let data = servings[i]
    for(let k in data) {
      formData.append('serving[' + i + '][' + k + ']', data[k]);
    }
  }
  let tag = uuid.v4()
  apiFetch("/api/serving/import", {
    method: "POST",
    body: formData
  }).then((responseData) => {
    for(let servingData of responseData.servings) {
      Dispatcher.dispatch({
        eventName: "servings.added",
        serving: servingData,
        tag
      })
    }
  })
  return tag
}

export function addServingFromSTT(serving) {
  serving = Object.assign({}, serving, {
    meal_id: MealStore.activeMeal.id,
  })
  importServings([serving])
}