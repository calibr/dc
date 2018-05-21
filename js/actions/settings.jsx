import 'whatwg-fetch'
import Dispatcher from "../dispatcher.jsx";
import {apiFetch} from '../util/fetch.jsx'

export function setValue(name, value) {
  var formData = new FormData();
  formData.append('name', name);
  formData.append('value', value);
  apiFetch("/api/settings/set", {
    method: "POST",
    body: formData
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
  apiFetch("/api/settings/delete", {
    method: "POST",
    body: formData
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
  apiFetch("/api/settings/delete", {
    method: "POST",
    body: formData
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "settings.delete",
      name: names,
      settings: responseData
    });
  });
}