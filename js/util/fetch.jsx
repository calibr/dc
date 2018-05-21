import {ROOT} from '../setup.jsx'

export function apiFetch(url, params = {}) {
  params = Object.assign({}, params, {credentials: 'same-origin'})
  return fetch(ROOT + url, params).then((response) => {
    return response.json();
  })
}