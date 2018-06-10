import 'whatwg-fetch'
import Dispatcher from "../dispatcher.jsx";
import {apiFetch} from '../util/fetch.jsx'
import UUID from 'uuid'
import {ROOT} from '../setup.jsx'

export function exportHistory({format, periodStart, periodEnd, timeZoneOffset, carbsPerBu}) {
  let query =
    'format=' + encodeURIComponent(format) + '&' +
    'periodStart=' + encodeURIComponent(periodStart) + '&' +
    'periodEnd=' + encodeURIComponent(periodEnd) + '&' +
    'timeZoneOffset=' + encodeURIComponent(timeZoneOffset) + '&' +
    'carbsPerBu=' + encodeURIComponent(carbsPerBu)

  let tmpFrame = document.createElement('iframe')
  tmpFrame.src = ROOT + "/api/history/export?" + query
  tmpFrame.style.width = '1px'
  tmpFrame.style.height = '1px'
  tmpFrame.style.opacity = 0
  tmpFrame.onload = function() {
    setTimeout(() => {
      tmpFrame.parentNode.removeChild(tmpFrame)
    }, 100e3)
    setTimeout(() => {
      Dispatcher.dispatch({
        eventName: "history.exported"
      });
    }, 1000)
  }
  document.body.appendChild(tmpFrame)
}