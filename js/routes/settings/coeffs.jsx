var app = require("../../f7app");
var React = require("react");

import Coeffs from "../../stores/Coef.jsx";
import Settings from "../../stores/Settings.jsx";
import {
  loadCoeffs
} from "../../actions/coeffs.jsx";
import {setValue as setSetting, deleteValue as delSetting} from '../../actions/settings.jsx'
import {fetchSettings} from '../../actions/actions.jsx'
import LoadingBox from "../../components/LoadingBox.jsx";
import navigator from "../../navigator.jsx";
import _ from 'lodash'

class SettingsCoeffsPage extends React.Component {
  constructor() {
    super()
  }
  componentWillMount() {
    this.state = {
      coeffs: Coeffs.getCoeffs(),
      settings: Settings.getSettings()
    }
    if (!this.state.coeffs) {
      loadCoeffs()
    }
    if (!this.state.settings) {
      fetchSettings()
    }
    Coeffs.on('change', this.onCoefsChange)
    Settings.on('change', this.onSettingsChange)
  }
  componentWillUnmount() {
    Coeffs.removeListener('change', this.onCoefsChange)
    Settings.removeListener('change', this.onSettingsChange)
  }
  onCoefsChange = () => {
    this.setState({
      coeffs: Coeffs.getCoeffs()
    })
  }
  onSettingsChange = () => {
    this.setState({
      settings: Settings.getSettings()
    })
  }
  addCoef = () => {
    navigator.navigate('/settings/coeffs/add')
  }
  onCoefClick (coef) {
    navigator.navigate('/settings/coeffs/' + coef.id)
  }
  render() {
    if(!this.state.coeffs || !this.state.settings) {
      return <div className="page-content">
        <LoadingBox/>
      </div>;
    }

    const { activeCoefId } = this.state.settings

    var coefElems = this.state.coeffs.map(coef => <a key={coef.id} className="item-link" onClick={this.onCoefClick.bind(this, coef)}>
      <div className="item-content">
        <div className="item-inner">
          <div className="item-title">{coef.name}</div>
          {
            coef.id == activeCoefId ?
              <div className="item-after"><span className="badge">активен</span></div>
              :
              null
          }
        </div>
      </div>
    </a>)

    return <div className="page-content">
      <div className="list-block">
        {
          coefElems.length ? <ul>{coefElems}</ul>
          :
          <div className="text-center">Ни один набор коэффициент не задан</div>
        }
      </div>
      <div className="content-block text-center">
        <a href="#" className="button button-fill color-green" onClick={this.addCoef}>
          Добавить набор коэффициентов
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
      <div className="center sliding">Наборы коэффициентов</div>
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