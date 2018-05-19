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

class SettingsMainPage extends React.Component {
  constructor() {
    super()
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
  render() {
    if(!this.state.settings) {
      return <div className="page-content">
        <LoadingBox/>
      </div>;
    }
    return <div className="page-content">
      <div className="list-block media-list not-fixed-height">
        <ul>
          <li>
            <a href="#" className="item-link item-content" onClick={navigator.navigate.bind(navigator, '/settings/coeffs')}>
              <div className="item-inner">
                <div className="item-title-row">
                  <div className="item-title"><i className="fa fa-list-alt"></i> Коэффициенты</div>
                  <div className="item-after"></div>
                </div>
                <div className="item-text">Задание углеводных коэффициентов</div>
              </div>
            </a>
          </li>
          <li>
            <a href="#" className="item-link item-content" onClick={navigator.navigate.bind(navigator, '/settings/nightscout')}>
              <div className="item-inner">
                <div className="item-title-row">
                  <div className="item-title"><i className="fa fa-bar-chart"></i> Nightscout</div>
                  <div className="item-after"></div>
                </div>
                <div className="item-text">Настройки интеграции с CGM in the Cloud</div>
              </div>
            </a>
          </li>
        </ul>
      </div>
    </div>;
  }
}

class SettingsMainPageNavBar extends React.Component {
  componentWillMount() {
  }
  componentWillUnmount() {
  }
  render() {
    return <div className="navbar-wrapper">
      <div className="center sliding">Настройки</div>
      <div className="right">
      </div>
    </div>
  }
}

module.exports = {
  page: SettingsMainPage,
  navbar: SettingsMainPageNavBar
};