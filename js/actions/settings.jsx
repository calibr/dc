import 'whatwg-fetch'
import Dispatcher from "../dispatcher.jsx";

import {ROOT} from '../setup.jsx'

export function setValue(name, value) {
  var formData = new FormData();
  formData.append('name', name);
  formData.append('value', value);
  fetch(ROOT + "/settings.php?a=set", {
    method: "POST",
    body: formData
  }).then((response) => {
    return response.json();
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "settings.set",
      name,
      settings: responseData,
    });
  });
}

export function deleteValue(name) {
  var formData = new FormData();
  formData.append('name', name);
  fetch(ROOT + "/settings.php?a=delete", {
    method: "POST",
    body: formData
  }).then((response) => {
    return response.json();
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "settings.delete",
      name,
      settings: responseData
    });
  });
}

export function deleteValueMass(names) {
  var formData = new FormData();
  formData.append('names[]', names);
  fetch(ROOT + "/settings.php?a=delete", {
    method: "POST",
    body: formData
  }).then((response) => {
    return response.json();
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "settings.delete",
      name: names,
      settings: responseData
    });
  });
}