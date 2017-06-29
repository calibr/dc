var React = require("react");
import ReactDOM from 'react-dom';
import Dish from "../stores/Dish.jsx";
import {loadDishes} from "../actions/actions.jsx";
import {carbsToBu} from "../util/bu.jsx";

var $ = require("../f7app").$;

class AbstractSwipeOut extends React.Component {
  constructor() {
    super();
  }
  onClick = () => {
    setTimeout(() => {
      var el = ReactDOM.findDOMNode(this);
      var transform = getComputedStyle(el.querySelector(".swipeout-content")).transform;
      var allowClick = true;
      var match = transform.match(/matrix\([0-9\.]+, [0-9\.]+, [0-9\.]+, [0-9\.]+, (.+?), [0-9\.]+\)/);
      if(match) {
        if(match[1] > 20) {
          allowClick = false;
        }
      }
      if(allowClick) {
        this.props.onClick();
      }
    }, 100);
  }
}

export default AbstractSwipeOut;