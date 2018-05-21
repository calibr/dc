import 'whatwg-fetch'
import Dispatcher from "../dispatcher.jsx";
import {apiFetch} from '../util/fetch.jsx'

export var addTreatment = function(data) {
  var formData = new FormData();
  for(let k in data) {
    formData.append(k, data[k]);
  }
  apiFetch("/api/nightscout/addTreatment", {
    method: "POST",
    body: formData
  }).then(data => {
    Dispatcher.dispatch({
      eventName: "treatment.add",
      data
    });
  });
};