var React = require("react");
var app = require("../f7app");

import navigator from "../navigator.jsx";

class HistoryPopover extends React.Component {
  constructor() {
    super()
    this.state = {
    }
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  onExportHistory() {
    app.closeModal()
    navigator.navigate("/history/export")
  }
  render() {
    return <ul>
      <li>
        <a href="#" className="list-button item-link" onClick={this.onExportHistory}>
          Экспорт истории
        </a>
      </li>
    </ul>;
  }
}

export default HistoryPopover;