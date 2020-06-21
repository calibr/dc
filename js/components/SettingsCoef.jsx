var React = require("react");
var ReactDOM = require("react-dom");

import {hour2} from '../util/date.jsx'
import AbstractSwipeOut from './AbstractSwipeOut.jsx'

class SettingsCoef extends AbstractSwipeOut {
  constructor() {
    super();
  }
  componentWillMount() {
    this.state = {
    }
  }
  onSwipeOutDelete = () => {
    if(this.props.onDelete) {
      this.props.onDelete()
    }
  }
  onValueChange = (event) => {
    var v = event.target.value
    v = v.replace(/[^0-9\.]/g, '')
    if(v && this.props.onValueChange) {
      this.props.onValueChange(v)
    }
  }
  render() {
    let coef = this.props.coef
    return <li className="swipeout">
      <div className="item-content swipeout-content">
        <div className="item-inner">
          <div className="item-title label">С {hour2(coef.from)} до {hour2(coef.to)}</div>
          <div className="item-input">
            <input
              onChange={this.onValueChange}
              value={coef.k}
              type="text"
              placeholder="Введите значение"
              name={this.props.name}
            />
          </div>
        </div>
      </div>
      <div className="swipeout-actions-left">
        <a href="#" onClick={this.onSwipeOutDelete} className="bg-red">Удалить</a>
      </div>
    </li>;
  }
}

export default SettingsCoef;