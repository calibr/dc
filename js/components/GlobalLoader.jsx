var React = require("react");
import Dispatcher from '../dispatcher.jsx'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

var $ = require("../f7app").$;

class GlobalLoader extends React.Component {
  constructor() {
    super();
    this.state = {
      visible: false
    }

    Dispatcher.register(this.dispatch.bind(this));
  }
  dispatch(event) {
    if(event.eventName === "servings.request_add") {
      this.setState({
        visible: true
      })
    }
    if(event.eventName === "servings.added") {
      this.setState({
        visible: false
      })
    }
    if(event.eventName === "coeffs.request_add" || event.eventName === "coeffs.request_update") {
      this.setState({
        visible: true
      })
    }
    if(event.eventName === "coeffs.added" || event.eventName === "coeffs.updated") {
      this.setState({
        visible: false
      })
    }
  }
  render() {
    const content = this.state.visible ? <div className="inner"></div> : null
    return <ReactCSSTransitionGroup
      transitionName="loader"
      transitionEnterTimeout={300}
      transitionLeaveTimeout={300}
    >
      {content}
    </ReactCSSTransitionGroup>
  }
}

export default GlobalLoader;