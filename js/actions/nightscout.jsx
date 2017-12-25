import 'whatwg-fetch'
import Dispatcher from "../dispatcher.jsx";

import {ROOT} from '../setup.jsx'

export var addTreatment = function(data) {
  var formData = new FormData();
  for(let k in data) {
    formData.append(k, data[k]);
  }
  fetch(ROOT + "/nightscout.php?a=addTreatment", {
    method: "POST",
    body: formData
  }).then((response) => {
    return response.json()
  }).then(data => {
    Dispatcher.dispatch({
      eventName: "treatment.add",
      data
    });
  });
};