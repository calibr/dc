var React = require("react");
var app = require("../f7app");

import navigator from "../navigator.jsx";
import {setDishOrder} from "../actions/actions.jsx";

class DishesPopover extends React.Component {
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
  onAddDish = () => {
    navigator.navigate("/dishes/add");
    app.closeModal();
  };
  render() {
    return <ul>
      <li><a href="#" className="list-button item-link" onClick={this.onOrderCarbsAsc}>
        Сортировка Углеводы возрастание
      </a></li>
      <li><a href="#" className="list-button item-link" onClick={this.onOrderCarbsDesc}>
        Сортировка Углеводы убывание
      </a></li>
      <li><a href="#" className="list-button item-link" onClick={this.onOrderAlphabet}>
        Сортировка по Алафвиту
      </a></li>
      <li><a href="#" className="list-button item-link color-green" onClick={this.onAddDish}>
        Добавить Блюдо
      </a></li>
    </ul>;
  }
}

export default DishesPopover;