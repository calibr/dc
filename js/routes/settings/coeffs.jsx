var app = require("../../f7app");
var React = require("react");

import Settings from "../../stores/Settings.jsx";
import {
  fetchSettings, saveSettings
} from "../../actions/actions.jsx";
import {setValue as setSetting, deleteValue as delSetting} from '../../actions/settings.jsx'
import LoadingBox from "../../components/LoadingBox.jsx";
import SettingsCoef from "../../components/SettingsCoef.jsx";
import navigator from "../../navigator.jsx";
import {pack as packCoef, unpack as unpackCoef} from '../../util/coef.jsx'
import {hour2} from '../../util/date.jsx'
import {listenCoefModal, unListenCoefModal} from './coefModal.jsx'
import _ from 'lodash'

class SettingsCoeffsPage extends React.Component {
  constructor() {
    super()
    this.onCoefValueChangeDebounced = _.debounce(this.onCoefValueChange.bind(this), 300)
  }
  getCoefs(settings) {
    var coefs = []
    if(!settings) {
      return coefs
    }
    for(let setting in settings) {
      let coef = unpackCoef(setting)
      if(coef) {
        coef.k = settings[setting]
        coefs.push(coef)
      }
    }
    coefs.sort((c1, c2) => {
      return c1.from - c2.from
    })
    return coefs
  }
  componentWillMount() {
    this.state = {
      settings: Settings.getSettings(),
      coefs: this.getCoefs(Settings.getSettings())
    };
    if(!this.state.settings) {
      fetchSettings();
    }
    Settings.on("change", this.onSettingsChange);
  }
  componentWillUnmount() {
    Settings.removeListener("change", this.onSettingsChange);
  }
  onSettingsChange = () => {
    var settings = Settings.getSettings()
    this.setState({
      settings,
      coefs: this.getCoefs(settings)
    });
  }
  optimizeCoefs = (coefs) => {
    var result = []
    for(let coef of coefs) {
      coef._l = coef.to - coef.from
    }
    coefs.sort((k1, k2) => k1._l - k2._l)

    function getInHour(hour) {
      for(let coef of coefs) {
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
    var coefs = this.state.coefs
    let deleteCoefsNames = coefs.map(coef => packCoef(coef.from, coef.to))
    coefs.push({from, to, k})
    coefs = this.optimizeCoefs(coefs)
    var dataToSave = {}
    for(let coef of coefs) {
      let key = packCoef(coef.from, coef.to)
      dataToSave[key] = coef.k
    }
    dataToSave['___delete'] = JSON.stringify(deleteCoefsNames)
    saveSettings(dataToSave)
  }
  onCoefDelete = (coef) => {
    app.closeSwipeout()
    var coefs = this.state.coefs
    if(coefs.length === 1) {
      return app.alert('Нельзя удалить последний коэффициент', 'Ошибка')
    }
    let deleteCoefsNames = coefs.map(coef => packCoef(coef.from, coef.to))
    let idx = coefs.indexOf(coef)
    if(idx < 0) {
      return
    }
    coefs.splice(idx, 1)
    coefs = this.optimizeCoefs(coefs)
    var dataToSave = {}
    for(let coef of coefs) {
      let key = packCoef(coef.from, coef.to)
      dataToSave[key] = coef.k
    }
    dataToSave['___delete'] = JSON.stringify(deleteCoefsNames)
    saveSettings(dataToSave)
  }
  onCoefValueChange = (coef, value) => {
    setSetting(packCoef(coef.from, coef.to), value)
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
    listenCoefModal(this.state.coefs)
  }
  render() {
    if(!this.state.settings) {
      return <div className="page-content">
        <LoadingBox/>
      </div>;
    }

    var coefElems = this.state.coefs.map(coef => <SettingsCoef
      key={coef.from + "|" + coef.to}
      coef={coef}
      onDelete={this.onCoefDelete.bind(this, coef)}
      onValueChange={this.onCoefValueChangeDebounced.bind(this, coef)}
    />)

    return <div className="page-content">
      <div className="content-block-title">Коэффициенты unit/ХЕ</div>
      <div className="list-block" id="settings-form">
        {
          coefElems.length ? <ul>{coefElems}</ul>
          :
          <div className="text-center">Ни один коэффициент не задан</div>
        }
      </div>
      <div className="content-block text-center">
        <a href="#" className="button button-fill color-green" onClick={this.addCoef}>
          Добавить коэффициент
        </a>
      </div>
    </div>;
  }
}

class SettingsCoeffsPageNavBar extends React.Component {
  componentWillMount() {
  }
  componentWillUnmount() {
  }
  onBackClick() {
    navigator.navigate('/settings')
  }
  render() {
    return <div className="navbar-wrapper">
      <div className="left">
        <a href="#" className="link" onClick={this.onBackClick}>
          <i className="icon icon-back"></i>
          <span>Назад</span>
        </a>
      </div>
      <div className="center sliding">Коэффициенты</div>
      <div className="right">
      </div>
    </div>
  }
}

module.exports = {
  page: SettingsCoeffsPage,
  navbar: SettingsCoeffsPageNavBar,
  title: 'Коэффициенты'
};