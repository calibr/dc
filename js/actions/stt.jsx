import 'whatwg-fetch'
import Dispatcher from "../dispatcher.jsx";

import {ROOT} from '../setup.jsx'

export function dishLookup(keywords) {
  var formData = new FormData();
  formData.append('keywords', JSON.stringify(keywords));
  fetch(ROOT + "/stt.php?a=keywordsToDishes", {
    method: "POST",
    body: formData
  }).then((response) => {
    return response.json();
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "stt.keywordsToDishes",
      name,
      settings: responseData,
    });
  });
}