var app = require("../../../f7app")
var React = require('React')

import _ from 'lodash'

import {
  addCoef, loadCoeffs, updateCoef
} from "../../../actions/coeffs.jsx";
import {
  fetchSettings
} from "../../../actions/actions.jsx";
import {
  setValue
} from "../../../actions/settings.jsx";
import Coef from '../../../stores/Coef.jsx'
import Settings from '../../../stores/Settings.jsx'
import {pack as packCoef, unpack as unpackCoef} from '../../../util/coef.jsx'
import navigator from "../../../navigator.jsx";
import {listenCoefModal, unListenCoefModal} from '../coefModal.jsx'
import SettingsCoef from "../../../components/SettingsCoef.jsx"
import {hour2} from '../../../util/date.jsx'
import LoadingBox from "../../../components/LoadingBox.jsx";

class SettingsAddCoefPage extends React.Component {
  constructor() {
    super()
  }
  componentWillMount() {
    this.state = {
      allCoefs: Coef.getCoeffs(),
      settings: Settings.getSettings(),
      coeffs: [],
      name: '',
      active: false
    };

    if (!this.state.allCoefs) {
      loadCoeffs()
    }

    if (!this.state.settings) {
      fetchSettings()
    }

    Object.assign(this.state, this.getStateFromId())

    Coef.on('added', this.onCoefAdded)
    Coef.on('updated', this.onCoefAdded)
    Coef.on('change', this.onCoefChange)
    Settings.on('change', this.onSettingsChange)
  }
  componentWillUnmount() {
    Coef.removeListener('added', this.onCoefAdded)
    Coef.removeListener('change', this.onCoefChange)
    Settings.removeListener('change', this.onSettingsChange)
  }
  getStateFromId () {
    const state = {}
    if (this.props.id && this.state.allCoefs && this.state.settings) {
      const coefSet = this.state.allCoefs.find(coef => coef.id == this.props.id)
      if (coefSet) {
        state.name = coefSet.name
        state.coeffs = JSON.parse(coefSet.values)
      }
      if (this.props.id == this.state.settings.activeCoefId) {
        state.active = true
      } else {
        state.active = false
      }
    }

    return state
  }
  setActiveCoefIfNeeded = (id) => {
    var dataRaw = app.formToJSON("#add-coef-form")
    if (dataRaw.active == 1) {
      setValue('activeCoefId', id)
    }
  }
  onCoefAdded = coef => {
    navigator.navigate('/settings/coeffs')
    this.setActiveCoefIfNeeded(coef.id)
  }
  onCoefUpdated = coef => {
    navigator.navigate('/settings/coeffs')
    this.setActiveCoefIfNeeded(coef.id)
  }
  onCoefChange = () => {
    const coeffsBefore = this.state.allCoefs
    this.setState({
      allCoefs: Coef.getCoeffs()
    })
    if (!coeffsBefore) {
      this.setState(this.getStateFromId())
    }
  }
  onSettingsChange = () => {
    const settingsBefore = this.state.settings
    this.setState({
      settings: Settings.getSettings()
    })
    if (!settingsBefore) {
      this.setState(this.getStateFromId())
    }
  }
  componentWillUpdate (prevProps, prevState) {
    if (prevProps.id !== this.props.id) {
      this.setState(this.getStateFromId())
    }
  }
  optimizeCoeffs = (coeffs) => {
    var result = []
    for(let coef of coeffs) {
      coef._l = coef.to - coef.from
    }
    coeffs.sort((k1, k2) => k1._l - k2._l)

    function getInHour(hour) {
      for(let coef of coeffs) {
        if(hour >= coef.from && hour < coef.to) {
          return coef
        }
      }
      return null
    }

    for(let h = 0; h <= 23; h++) {
      let coef = getInHour(h)
      if(coef) {
        result.push({
          from: h,
          to: h + 1,
          k: coef.k
        })
      }
    }

    if(result.length) {
      let curCoef = result[0]
      let resultPrepared = []
      for(let coef of result) {
        if(coef.k === curCoef.k) {
          curCoef.to = coef.to
        }
        else {
          resultPrepared.push(curCoef)
          curCoef = coef
        }
      }
      resultPrepared.push(curCoef)
      result = resultPrepared
      if(result[0].from != 0) {
        result[0].from = 0
      }
      if(result[result.length - 1].to != 24) {
        result[result.length - 1].to = 24
      }
    }

    return result
  }
  insertCoef = (from, to, k) => {
    var coeffs = this.state.coeffs.slice()
    let deleteCoeffsNames = coeffs.map(coef => packCoef(coef.from, coef.to))
    coeffs.push({from, to, k})
    coeffs = this.optimizeCoeffs(coeffs)
    var dataToSave = {}
    for(let coef of coeffs) {
      let key = packCoef(coef.from, coef.to)
      dataToSave[key] = coef.k
    }
    dataToSave['___delete'] = JSON.stringify(deleteCoeffsNames)

    this.setState({
      coeffs
    })
  }
  onCoefDelete = (coef) => {
    app.closeSwipeout()
    var coeffs = this.state.coeffs.slice()
    if(coeffs.length === 1) {
      return app.alert('Нельзя удалить последний коэффициент', 'Ошибка')
    }
    let deleteCoeffsNames = coeffs.map(coef => packCoef(coef.from, coef.to))
    let idx = coeffs.indexOf(coef)
    if(idx < 0) {
      return
    }
    coeffs.splice(idx, 1)
    coeffs = this.optimizeCoeffs(coeffs)
    var dataToSave = {}
    for(let coef of coeffs) {
      let key = packCoef(coef.from, coef.to)
      dataToSave[key] = coef.k
    }
    dataToSave['___delete'] = JSON.stringify(deleteCoeffsNames)

    this.setState({
      coeffs
    })
  }
  onCoefValueChange = function(coef, value) {
    const coeffs = this.state.coeffs.slice()
    const i = coeffs.indexOf(coef)
    coeffs[i].k = value
    this.setState({
      coeffs
    })
    //setSetting(packCoef(coef.from, coef.to), value)
  }
  addCoef = () => {
    var hoursOptions = []
    for(let h = 0; h <= 24; h++) {
      hoursOptions.push('<option value="' + h + '">' + hour2(h) + '</option>')
    }
    hoursOptions = hoursOptions.join('')
    var modal = app.modal({
      title: 'Добавление нового коэффициента',
      text: 'Введите час начала и окончания действия коэффициента',
      afterText: `<div class="input-field modal-input-double">
          С:<br>
          <select id="coef-start-hour" class="modal-text-input">${hoursOptions}</select>
        </div>
        <div class="input-field modal-input-double">
          По:<br>
          <select id="coef-end-hour" class="modal-text-input">${hoursOptions}</select>
        </div>
      `,
      onClick: () => {
        unListenCoefModal()
      },
      buttons: [
        {
          text: 'Добавить',
          bold: true,
          onClick: () => {
            this.insertCoef(
              parseInt(app.$('#coef-start-hour').val()),
              parseInt(app.$('#coef-end-hour').val()),
              1
            )
          }
        },
        {
          text: 'Отменить'
        }
      ]
    })
    listenCoefModal(this.state.coeffs)
  }
  onNameChange = event => {
    this.setState({
      name: event.target.value
    })
  }
  onChangeActive = event => {
    this.setState({
      active: event.target.checked
    })
  }
  render() {
    const { active } = this.state

    if(!this.state.allCoefs) {
      return <div className="page-content">
        <LoadingBox/>
      </div>;
    }

    var coefElems = this.state.coeffs.map((coef, i) => <SettingsCoef
      key={coef.from + "|" + coef.to}
      coef={coef}
      onDelete={this.onCoefDelete.bind(this, coef)}
      onValueChange={this.onCoefValueChange.bind(this, coef)}
      name={'coef_' + coef.from + "|" + coef.to}
    />)

    return <div className="page-content">
      <form id="add-coef-form">
        <div className="list-block">
          <ul>
            <li>
              <label className="label-checkbox item-content">
                <input type="checkbox" name="active" value="1" checked={active} onChange={this.onChangeActive}/>
                <div className="item-media">
                  <i className="icon icon-form-checkbox"></i>
                </div>
                <div className="item-inner">
                  <div className="item-title">Активен</div>
                </div>
              </label>
            </li>
            <li>
              <div className="item-content">
                <div className="item-inner">
                  <div className="item-input">
                      <input value={this.state.name} type="text"
                        onChange={this.onNameChange}
                        name="name" placeholder="Введите название набора коэффициентов"/>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div className="content-block-title">Коэффициенты unit/ХЕ</div>
        <div className="list-block">
          {
            coefElems.length ? <ul>{coefElems}</ul>
            :
            <div className="text-center">Ни один коэффициент не задан</div>
          }
        </div>
      </form>
      <div className="content-block text-center">
        <a href="#" className="button button-fill color-green" onClick={this.addCoef}>
          Добавить коэффициент
        </a>
      </div>
    </div>;
  }
}

class SettingsAddCoefPageNavBar extends React.Component {
  componentWillMount() {
  }
  componentWillUnmount() {
  }
  onBackClick() {
    navigator.navigate('/settings/coeffs')
  }
  onCoefAdd = () => {
    const data = {}
    var dataRaw = app.formToJSON("#add-coef-form");
    try {
      data.name = dataRaw.name
      if (!data.name) {
        data.name = 'Coefficients ' + new Date().toLocaleString()
      }
      const values = []
      for (const k in dataRaw) {
        const unpacked = unpackCoef(k)
        if (!unpacked) {
          continue
        }
        values.push({
          from: unpacked.from,
          to: unpacked.to,
          k: dataRaw[k]
        })
      }
      data.values = JSON.stringify(values)
      if(this.props.id) {
        updateCoef(this.props.id, data)
      }
      else {
        addCoef(data);
      }
    }
    catch(err) {
      app.alert(err.message, "Ошибка");
    }
  }
  render() {
    return <div className="navbar-wrapper">
      <div className="left">
        <a href="#" className="link" onClick={this.onBackClick}>
          <i className="icon icon-back"></i>
          <span>Назад</span>
        </a>
      </div>
      <div className="center sliding">{this.props.id ? "Редактирование набора коэффициентов" : "Добавление набора коэффициентов"}</div>
      <div className="right">
        <a href="#" className="button button-fill color-green" onClick={this.onCoefAdd}>
          {this.props.id ? "Сохранить" : "Добавить"}
        </a>
      </div>
    </div>
  }
}

module.exports = {
  page: SettingsAddCoefPage,
  navbar: SettingsAddCoefPageNavBar,
  title: 'Добавление/Редактирование набора коэффициентов'
};