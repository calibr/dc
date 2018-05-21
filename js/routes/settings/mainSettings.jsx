var app = require("../../f7app");
var React = require("react");

import Settings from "../../stores/Settings.jsx";
import {
  fetchSettings, saveSettings
} from "../../actions/actions.jsx";
import {setValue as setSetting, deleteValue as delSetting} from '../../actions/settings.jsx'
import LoadingBox from "../../components/LoadingBox.jsx";
import navigator from "../../navigator.jsx";
import _ from 'lodash'

class MainSettingsPage extends React.Component {
  constructor() {
    super()
    this.saveFieldDebounced = _.debounce(this.saveField.bind(this), 300)
    this.onValueChanged = this.onValueChanged.bind(this)
  }
  componentWillMount() {
    this.state = {
      settings: Settings.getSettings()
    };
    if(!this.state.settings) {
      fetchSettings();
    }
    Settings.on("change", this.onSettingsChange)
  }
  componentWillUnmount() {
    Settings.removeListener("change", this.onSettingsChange)
  }
  onSettingsChange = () => {
    var settings = Settings.getSettings()
    this.setState({
      settings
    })
  }
  saveField(key, target) {
    setSetting(key, target.value)
  }
  onValueChanged(key, event) {
    this.saveFieldDebounced(key, event.target)
    let settings = this.state.settings
    settings[key] = event.target.value
    this.setState({settings})
  }
  render() {
    if(!this.state.settings) {
      return <div className="page-content">
        <LoadingBox/>
      </div>;
    }
    return <div className="page-content">
      <div className="list-block">
        <ul>
          <li>
            <div className="item-content">
              <div className="item-media"><i className="fa fa-cutlery"></i></div>
              <div className="item-inner">
                <div className="item-title label">Грамм на 1 ХЕ</div>
                <div className="item-input">
                  <input
                    type="text"
                    onChange={this.onValueChanged.bind(this, 'carbs_per_bu')}
                    value={this.state.settings.carbs_per_bu}
                    placeholder="Число грамм углеводов на 1-у хлебную единицу"/>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>;
  }
}

class MainSettingsPageNavBar extends React.Component {
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
      <div className="center sliding">Основные настройки</div>
      <div className="right">
      </div>
    </div>
  }
}

module.exports = {
  page: MainSettingsPage,
  navbar: MainSettingsPageNavBar,
  title: 'Основные настройки'
};