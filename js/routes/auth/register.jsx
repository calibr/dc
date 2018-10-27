var app = require("../../f7app");
var React = require("react");

import LoadingBox from "../../components/LoadingBox.jsx";
import navigator from "../../navigator.jsx";
import _ from 'lodash'
import AuthStore from '../../stores/Auth.jsx'
import UserStore from '../../stores/User.jsx'
import {register, setRegisterError, clearErrors} from '../../actions/auth.jsx'

function getState() {
  return {
    errorCode: AuthStore.registerError && AuthStore.registerError.code,
    errorText: AuthStore.registerError && AuthStore.registerError.text,
    inProgress: AuthStore.registerInProgress
  }
}

class RegisterPage extends React.Component {
  constructor() {
    super()
    this.state = getState()
    this.onRegister = this.onRegister.bind(this)
  }
  componentDidMount() {
    this.onAuthStoreChange = this.onAuthStoreChange.bind(this)
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
  onRegister() {
    clearErrors()
    if(this.state.password !== this.state.password2) {
      return setRegisterError('passwords_dont_match')
    }
    register({
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
        else if(this.state.errorCode === 'login_short') {
          mainError = 'Имя пользователя слишком короткое'
          fieldError['login'] = ''
        }
        else if(this.state.errorCode === 'password_short') {
          mainError = 'Пароль слишком короткий'
          fieldError['password'] = ''
        }
        else if(this.state.errorCode === 'login_taken') {
          mainError = 'Имя пользователя уже занято'
        }
        else if(this.state.errorCode === 'passwords_dont_match') {
          mainError = 'Пароли не совпадают'
          fieldError['password'] = ''
          fieldError['password2'] = ''
        }
      }
      else {
        mainError = 'Невозможно зарегистрировать аккаунт'
      }
    }

    if(this.state.inProgress) {
      return <div className="page-content">
        <LoadingBox/>
      </div>
    }

    return <div className="page-content login-screen-content">
      <div className="login-screen-title">Регистрация</div>
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
            <li className={"item-content " + (('password2' in fieldError) ? 'errored' : '')}>
              <div className="item-inner">
                <div className="item-title label">Повтор пароля</div>
                <div className="item-input">
                  <input
                    onChange={this.onFieldChange.bind(this, 'password2')}
                    type="password"
                    name="password"
                    placeholder="Введите пароль снова"
                    value={this.state.password2}/>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div className="list-block">
          <ul>
            <li><a onClick={this.onRegister} href="#" className="item-link list-button">Зарегистрироваться</a></li>
          </ul>
          <div className="list-block-label">
            <p>Приложение является экспериментальным, используйте его на свой страх и риск. Перед использованием проконсультируйтесь с врачем. Автор не несет отвественности за последствия, вызванные использованием данного приложения.</p>
            <p><a href="#" onClick={navigator.navigate.bind(navigator, '/auth')} className="close-login-screen">Войти в существующий аккаунт</a></p>
          </div>
        </div>
      </form>
    </div>
  }
}

module.exports = {
  page: RegisterPage,
  hideNavbar: true,
  hideTabbar: true,
  title: 'Регистрация'
};