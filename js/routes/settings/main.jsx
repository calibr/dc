var app = require("../../f7app");
var React = require("react");

import Settings from "../../stores/Settings.jsx";
import {
  fetchSettings, saveSettings
} from "../../actions/actions.jsx";
import LoadingBox from "../../components/LoadingBox.jsx";
import navigator from "../../navigator.jsx";

class SettingsMainPage extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
    this.state = {
      settings: Settings.getSettings()
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
    this.setState({
      settings: Settings.getSettings()
    });
  }
  render() {
    if(!this.state.settings) {
      return <div className="page-content">
        <LoadingBox/>
      </div>;
    }
    return <div className="page-content">
      <div className="content-block-title">Коэффициенты</div>
      <div className="list-block" id="settings-form">
        <ul>
          <li>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title label">Утренний коэффициент</div>
                <div className="item-input">
                  <input
                    defaultValue={this.state.settings["morning-coef"]}
                    name="morning-coef" type="text" placeholder="Введите значение"/>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title label">Дневной коэффициент</div>
                <div className="item-input">
                  <input
                    defaultValue={this.state.settings["day-coef"]}
                    name="day-coef" type="text" placeholder="Введите значение"/>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title label">Вечерний коэффициент</div>
                <div className="item-input">
                  <input
                    defaultValue={this.state.settings["evening-coef"]}
                    name="evening-coef" type="text" placeholder="Введите значение"/>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title label">Ночной коэффициент</div>
                <div className="item-input">
                  <input
                    defaultValue={this.state.settings["night-coef"]}
                    name="night-coef" type="text" placeholder="Введите значение"/>
                </div>
              </div>
            </div>
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
  onSettingsSave() {
    var data = app.formToJSON("#settings-form");
    try {
      for(let k in data) {
        let v = data[k];
        if(!v) {
          throw new Error("Все значения должны быть введены");
        }
      }
      saveSettings(data);
    }
    catch(err) {
      app.alert(err.message, "Ошибка");
    }
  }
  render() {
    return <div className="navbar-wrapper">
      <div className="center sliding">Настройки</div>
      <div className="right">
        <a href="#" className="button button-fill color-green" onClick={this.onSettingsSave}>
          Сохранить
        </a>
      </div>
    </div>
  }
}

module.exports = {
  page: SettingsMainPage,
  navbar: SettingsMainPageNavBar
};