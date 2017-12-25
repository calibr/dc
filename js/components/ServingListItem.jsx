var React = require("react");
import ReactDOM from 'react-dom';
import Dish from "../stores/Dish.jsx";
import {loadDishes} from "../actions/actions.jsx";
import {carbsToBu} from "../util/bu.jsx";
import {calc, round} from "../util/calc.jsx";
import AbstractSwipeOut from './AbstractSwipeOut.jsx'

var $ = require("../f7app").$
var app = require("../f7app")

class ServingListItem extends AbstractSwipeOut {
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
  render() {
    var serving = this.props.serving
    var coef = this.props.coef
    if(!this.state.dish) {
      return <li/>;
    }
    var carbsInServing = this.state.dish.carbs/100 * serving.weight;
    var buInServing = carbsToBu(carbsInServing);
    var units = calc(carbsInServing, coef)
    return <li className="swipeout serving-list-item">
      <div onClick={this.onClick} className="swipeout-content item-content item-link">
        <div className="item-inner">
          <div className="item-title">{this.state.dish.title} ({this.state.dish.carbs})</div>
          <div className="item-after">
            <span className="badge">{serving.weight}г./{round(carbsInServing)}г.у.</span>
            <span className="badge">{units}U</span>
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