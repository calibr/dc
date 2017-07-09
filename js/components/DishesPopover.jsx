var React = require("react");
var app = require("../f7app");

import navigator from "../navigator.jsx";
import {setDishOrder} from "../actions/actions.jsx";
import Dish from '../stores/Dish.jsx'
import Settings from "../stores/Settings.jsx";

class DishesPopover extends React.Component {
  constructor() {
    super()
    this.state = {
      settings: Settings.getSettings()
    }
  }
  onOrderCarbsAsc = () => {
    setDishOrder("carbs", "asc");
    app.closeModal();
  };
  onOrderCarbsDesc = () => {
    setDishOrder("carbs", "desc");
    app.closeModal();
  };
  onOrderAlphabet = () => {
    setDishOrder("title", "asc");
    app.closeModal();
  };
  onOrderDate = () => {
    setDishOrder("date", "desc");
    app.closeModal();
  };
  onAddDish = () => {
    navigator.navigate("/dishes/add");
    app.closeModal();
  };
  onAddComplexDish = () => {
    navigator.navigate("/dishes/addComplex");
    app.closeModal();
  };
  onSettingsChange = () => {
    this.setState({
      settings: Settings.getSettings()
    });
  }
  componentDidMount() {
    Settings.on("change", this.onSettingsChange);
  }
  componentWillUnmount() {
    Settings.removeListener("change", this.onSettingsChange);
  }
  render() {
    var orderStr = this.state.settings["dish-order"]
    var addDishButton = <li><a href="#" className="list-button item-link color-green" onClick={this.onAddDish}>
        Добавить Блюдо
      </a></li>;
    var addComplexDishButton = <li><a href="#" className="list-button item-link color-green" onClick={this.onAddComplexDish}>
        Добавить Сложное Блюдо
      </a></li>
    return <ul>
      <li><a href="#" className="list-button item-link" onClick={this.onOrderCarbsAsc}>
        {orderStr === 'carbs:asc' ? '✓' : ''} Сорт. Углеводы возрастание
      </a></li>
      <li><a href="#" className="list-button item-link" onClick={this.onOrderCarbsDesc}>
        {orderStr === 'carbs:desc' ? '✓' : ''} Сорт. Углеводы убывание
      </a></li>
      <li><a href="#" className="list-button item-link" onClick={this.onOrderAlphabet}>
        {orderStr === 'title:asc' ? '✓' : ''} Сорт. по Алафвиту
      </a></li>
      <li><a href="#" className="list-button item-link" onClick={this.onOrderDate}>
        {orderStr === 'date:desc' ? '✓' : ''} Сорт. по Дате
      </a></li>
      {!this.disableAdd ? addDishButton : null}
      {!this.disableAdd ? addComplexDishButton : null}
    </ul>;
  }
}

export class DishesPopoverShort extends DishesPopover {
  constructor() {
    super()
    this.disableAdd = true
  }
}

export default DishesPopover;