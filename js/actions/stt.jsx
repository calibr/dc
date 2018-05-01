import 'whatwg-fetch'
import Dispatcher from "../dispatcher.jsx";
import UUID from 'uuid'
import {SpeechToText} from '../util/stt/speechToText.jsx'
import {ROOT} from '../setup.jsx'

let sttByTag = {}

export function dishLookup(keywords, tag) {
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
      data: responseData,
      tag
    });
  })
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

export function startRecognize() {
  let tag = UUID.v4()

  setTimeout(() => {
    let stt = new SpeechToText()
    sttByTag[tag] = stt
    stt.on('start', () => {
    })
    stt.on('end', function onSttEnd() {
      Dispatcher.dispatch({
        eventName: "stt.end",
        tag
      })
      delete sttByTag[tag]
    })
    stt.on('result', function onSttResult(res) {
      dishLookup([res.dishName], tag)
      Dispatcher.dispatch({
        eventName: "stt.resut",
        result: res,
        tag
      })
    })
    stt.on('noresult', function onSttNoResult(res) {
      Dispatcher.dispatch({
        eventName: "stt.noresult",
        tag
      })
    })
    stt.on('raw', function onSttRaw(raw) {
      Dispatcher.dispatch({
        eventName: "stt.raw",
        text: raw,
        tag
      })
    })
    stt.start()

    Dispatcher.dispatch({
      eventName: "stt.start",
      tag
    })
  }, 0)

  return {tag}
}

export function changeWeight(weight) {
  Dispatcher.dispatch({
    eventName: "stt.weightChange",
    weight
  })
}

export function cancelRecognition(tag) {
  if(!sttByTag[tag]) {
    return
  }
  sttByTag[tag].cancel()
}