var app = require("../../f7app");
var React = require("react");

import navigator from "../../navigator.jsx";
import escapeRegexp from 'escape-string-regexp'
import {login, clearErrors} from '../../actions/auth.jsx'
import AuthStore from '../../stores/Auth.jsx'
import UserStore from '../../stores/User.jsx'

function getState() {
  return {
    errorCode: AuthStore.loginError && AuthStore.loginError.code,
    errorText: AuthStore.loginError && AuthStore.loginError.text,
    inProgress: AuthStore.loginInProgress
  }
}

class LoginPage extends React.Component {
  constructor() {
    super()
    this.state = getState()
    this.onLogin = this.onLogin.bind(this)
    this.onAuthStoreChange = this.onAuthStoreChange.bind(this)
    this.onUserStoreChange = this.onUserStoreChange.bind(this)
  }
  componentDidMount() {
    AuthStore.on('change', this.onAuthStoreChange)
    UserStore.on('change', this.onUserStoreChange)
  }
  componentWillUnmount() {
    AuthStore.removeListener('change', this.onAuthStoreChange)
    UserStore.removeListener('change', this.onUserStoreChange)
  }
  onAuthStoreChange() {
    this.setState(getState())
  }
  onUserStoreChange() {
    if(UserStore.auth) {
      navigator.navigate('/calc')
    }
  }
  onFieldChange(field, event) {
    let obj = {}
    obj[field] = event.target.value
    this.setState(obj)
  }
  onLogin() {
    clearErrors()
    login({
      login: this.state.login,
      password: this.state.password
    })
  }
  render() {
    let mainError = null
    let fieldError = {}
    if(this.state.errorText) {
      if(this.state.errorCode) {
        if(this.state.errorCode === 'login_empty') {
          mainError = 'Введите имя пользователя'
          fieldError['login'] = ''
        }
        else if(this.state.errorCode === 'password_empty') {
          mainError = 'Введите пароль'
          fieldError['password'] = ''
        }
      }
      else {
        mainError = 'Неверное имя пользователя или пароль'
      }
    }
    return <div className="page-content login-screen-content">
      <div className="login-screen-title">Вход</div>
      <form>
        {
          mainError ? <div className="color-red text-center">{mainError}</div> : null
        }
        <div className="list-block">
          <ul>
            <li className={"item-content " + (('login' in fieldError) ? 'errored' : '')}>
              <div className="item-inner">
                <div className="item-title label">Имя пользователя</div>
                <div className="item-input">
                  <input
                    onChange={this.onFieldChange.bind(this, 'login')}
                    type="text"
                    name="username"
                    placeholder="Введите имя пользователя"
                    value={this.state.login}/>
                </div>
              </div>
            </li>
            <li className={"item-content " + (('password' in fieldError) ? 'errored' : '')}>
              <div className="item-inner">
                <div className="item-title label">Пароль</div>
                <div className="item-input">
                  <input
                    onChange={this.onFieldChange.bind(this, 'password')}
                    type="password"
                    name="password"
                    placeholder="Введите пароль"
                    value={this.state.password}/>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div className="list-block">
          <ul>
            <li><a onClick={this.onLogin} href="#" className="item-link list-button">Войти</a></li>
          </ul>
          <div className="list-block-label">
            <p>Приложение является крайне экспериментальным, используйте его на свой страх и риск. Перед использованием проконсультируйтесь с врачем. Автор не несет отвественности за последствия, вызванные использованием данного приложения.</p>
            <p><a href="#" onClick={navigator.navigate.bind(navigator, '/auth/register')} className="close-login-screen">Зарегистрироваться</a></p>
          </div>
        </div>
      </form>
    </div>
  }
}

module.exports = {
  page: LoginPage,
  hideNavbar: true,
  hideTabbar: true,
  title: 'Вход'
};