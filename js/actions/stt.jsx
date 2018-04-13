import 'whatwg-fetch'
import Dispatcher from "../dispatcher.jsx";
import uuid from 'uuid'

import {ROOT} from '../setup.jsx'

export function dishLookup(keywords) {
  var formData = new FormData();
  var reqId = uuid.v4()
  formData.append('keywords', JSON.stringify(keywords));
  fetch(ROOT + "/stt.php?a=keywordsToDishes", {
    method: "POST",
    body: formData
  }).then((response) => {
    return response.json();
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "stt.keywordsToDishes",
      data: responseData,
      reqId
    });
  })
  return reqId
}

export function showDialog() {
  Dispatcher.dispatch({
    eventName: "stt.dialogStateChange",
    visible: true
  })
}

export function hideDialog() {
  Dispatcher.dispatch({
    eventName: "stt.dialogStateChange",
    visible: false
  })
}