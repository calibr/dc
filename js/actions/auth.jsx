import 'whatwg-fetch'
import Dispatcher from "../dispatcher.jsx";
import {apiFetch} from '../util/fetch.jsx'
import UUID from 'uuid'

export function login({login, password}) {
  var formData = new FormData();
  formData.append('login', login);
  formData.append('password', password);

  Dispatcher.dispatch({
    eventName: "auth.loginInProgress"
  })

  apiFetch("/api/auth/login", {
    method: "POST",
    body: formData
  }).then((responseData) => {
    if(responseData.error) {
      Dispatcher.dispatch({
        eventName: "auth.loginFailed",
        error: responseData.error,
        errorCode: responseData.errorCode,
      })
      return
    }
    Dispatcher.dispatch({
      eventName: "user.init",
      auth: true,
      user: responseData.user,
    });
  });
}

export function register({login, password}) {
  var formData = new FormData();
  formData.append('login', login);
  formData.append('password', password);

  Dispatcher.dispatch({
    eventName: "auth.registerInProgress"
  })

  apiFetch("/api/auth/register", {
    method: "POST",
    body: formData
  }).then((responseData) => {
    if(responseData.error) {
      Dispatcher.dispatch({
        eventName: "auth.registerFailed",
        error: responseData.error,
        errorCode: responseData.errorCode
      })
      return
    }
    Dispatcher.dispatch({
      eventName: "user.init",
      auth: true,
      user: responseData.user
    });
  });
}

export function setRegisterError(code) {
  Dispatcher.dispatch({
    eventName: "auth.registerFailed",
    error: 'failed',
    errorCode: code
  })
}

export function clearErrors() {
  Dispatcher.dispatch({
    eventName: "auth.clearErrors"
  })
}