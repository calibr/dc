var React = require("react");
import ReactDOM from 'react-dom';
import Dish from "../stores/Dish.jsx";
import {loadDishes} from "../actions/actions.jsx";
import {carbsToBu} from "../util/bu.jsx";

var $ = require("../f7app").$;

class ServingListItem extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
    this.state = {
      dish: Dish.getById(this.props.serving.dish_id)
    };
    if(!this.state.dish) {
      loadDishes();
    }
  }
  componentDidMount() {
    Dish.on("change", this.onDishChange);
  }
  componentWillUnmount() {
    Dish.removeListener("change", this.onDishChange);
  }
  onSwipeOutDelete = () => {
    if(this.props.onDelete) {
      this.props.onDelete();
    }
  }
  onSwipeOutAte = () => {
    if(this.props.onAte) {
      this.props.onAte();
    }
  }
  onDishChange = () => {
    this.setState({
      dish: Dish.getById(this.props.serving.dish_id)
    });
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
  render() {
    var serving = this.props.serving;
    if(!this.state.dish) {
      return <li/>;
    }
    var carbsInServing = this.state.dish.carbs/100 * serving.weight;
    var buInServing = carbsToBu(carbsInServing);
    return <li className="swipeout serving-list-item">
      <div onClick={this.onClick} className="swipeout-content item-content item-link">
        <div className="item-inner">
          <div className="item-title">{this.state.dish.title} ({this.state.dish.carbs})</div>
          <div className="item-after">
            <span className="badge">{serving.weight} г.</span>
            <span className="badge">{buInServing} ХЕ</span>
          </div>
        </div>
      </div>
      <div className="swipeout-actions-left">
        <a href="#" onClick={this.onSwipeOutDelete} className="bg-red">Удалить</a>
        <a href="#" onClick={this.onSwipeOutAte} className="bg-blue">{this.props.ateText || "Съел"}</a>
      </div>
    </li>;
  }
}

export default ServingListItem;