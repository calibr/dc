var app = require("../../f7app");
var React = require("react");

import LoadingBox from "../../components/LoadingBox.jsx"
import navigator from "../../navigator.jsx"
import {exportHistory} from '../../actions/history.jsx'
import {fetchSettings} from '../../actions/actions.jsx'
import SettingsStore from '../../stores/Settings.jsx'
import MealHistoryStore from '../../stores/MealHistory.jsx'

class HistoryExportPage extends React.Component {
  constructor() {
    super()
    this.state = {
      settings: SettingsStore.getSettings(),
      loading: false
    }
    this.onExport = this.onExport.bind(this)
    this.onSettingsStoreChange = this.onSettingsStoreChange.bind(this)
    this.onMealHistoryExported = this.onMealHistoryExported.bind(this)
  }
  componentWillMount() {
  }
  componentDidMount() {
    this.calendarPeriodStart = app.calendar({
      input: '#history-period-start',
      value: [new Date().getTime() - 24 * 3600 * 7 * 1000],
      dateFormat: 'd M, yyyy'
    })
    this.calendarPeriodEnd = app.calendar({
      input: '#history-period-end',
      value: [new Date().getTime()],
      dateFormat: 'd M, yyyy'
    })
    SettingsStore.on('change', this.onSettingsStoreChange)
    if(!SettingsStore.getSettings()) {
      fetchSettings()
      return
    }
    MealHistoryStore.on('exported', this.onMealHistoryExported)
  }
  componentWillUnmount() {
    SettingsStore.removeListener('change', this.onSettingsStoreChange)
    MealHistoryStore.removeListener('exported', this.onMealHistoryExported)
  }
  onSettingsStoreChange() {
    this.setState({settings: SettingsStore.getSettings()})
  }
  onMealHistoryExported() {
    this.setState({loading: false})
  }
  onExport() {
    this.setState({loading: true})
    exportHistory({
      format: 'xls',
      periodStart: Math.round(this.calendarPeriodStart.value/1000),
      periodEnd: Math.round(this.calendarPeriodEnd.value/1000),
      timeZoneOffset: new Date().getTimezoneOffset(),
      carbsPerBu: SettingsStore.getSetting('carbs_per_bu')
    })
  }
  render() {
    if(!SettingsStore.getSettings()) {
      return <div className="page-content">
        <LoadingBox/>
      </div>
    }
    return <div className="page-content">
      <div className="list-block">
        <ul>
          <li>
            <a href="#" className="item-link smart-select" data-open-in="picker" data-back-on-select="true">
              <select name="export-format" defaultValue="xls">
                <option value="xls">XLS</option>
              </select>
              <div className="item-content">
                <div className="item-inner">
                  <div className="item-title">Формат</div>
                  <div className="item-after">XLS</div>
                </div>
              </div>
            </a>
          </li>
          <li>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title label">Начало периода</div>
                <div className="item-input">
                  <input
                    ref="periodStart"
                    id="history-period-start"
                    type="text"
                    placeholder="Выберите начало периода"/>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title label">Конец периода</div>
                <div className="item-input">
                  <input
                    ref="periodEnd"
                    id="history-period-end"
                    type="text"
                    placeholder="Выберите конец периода"/>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      {
        this.state.loading ?
        <LoadingBox/>
        :
        <div className="content-block text-center">
          <a href="#" className="button button-fill color-green" onClick={this.onExport}>
            Экспорт
          </a>
        </div>
      }
    </div>;
  }
}

class HistoryExportPageNavBar extends React.Component {
  componentWillMount() {
  }
  componentWillUnmount() {
  }
  onBack() {
    navigator.back()
  }
  render() {
    return <div className="navbar-wrapper">
      <div className="left">
        <a href="#" className="link" onClick={this.onBack}>
          <i className="icon icon-back"></i>
          <span>Назад</span>
        </a>
      </div>
      <div className="center sliding">Экспорт истории</div>
      <div className="right">
      </div>
    </div>
  }
}

module.exports = {
  page: HistoryExportPage,
  navbar: HistoryExportPageNavBar,
  title: 'История'
};