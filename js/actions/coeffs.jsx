import 'whatwg-fetch'
import Dispatcher from "../dispatcher.jsx";
import {apiFetch} from '../util/fetch.jsx'

var loadingCoeffs = false;
export var loadCoeffs = function() {
  if(loadingCoeffs) {
    return;
  }
  loadingCoeffs = true;
  apiFetch("/api/coef/fetch").then((data) => {
    loadingCoeffs = false;
    Dispatcher.dispatch({
      eventName: "coeffs.list",
      coeffs: data
    });
  });
};

export var addCoef = function(data, opts = {}) {
  var formData = new FormData();
  for(let k in data) {
    formData.append(k, data[k]);
  }
  Dispatcher.dispatch({
    eventName: "coeffs.request_add",
    data
  });
  apiFetch("/api/coef/add", {
    method: "POST",
    body: formData
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "coeffs.added",
      coef: responseData,
      tag: opts.tag
    });
  });
};

export var updateCoef = function(id, data, opts = {}) {
  var formData = new FormData();
  for(let k in data) {
    formData.append(k, data[k]);
  }
  Dispatcher.dispatch({
    eventName: "coeffs.request_update",
    data
  });
  apiFetch("/api/coef/update?id=" + encodeURIComponent(id), {
    method: "POST",
    body: formData
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "coeffs.updated",
      coef: responseData,
      tag: opts.tag
    });
  });
};