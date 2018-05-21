import 'whatwg-fetch'
import Dispatcher from "../dispatcher.jsx";

import {apiFetch} from '../util/fetch.jsx'

export function fetch(name, value) {
  var formData = new FormData();
  formData.append('name', name);
  formData.append('value', value);
  apiFetch("/api/user/fetch", {
    method: "POST",
    body: formData
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "user.init",
      auth: responseData.auth,
      user: responseData.user
    });
  });
}