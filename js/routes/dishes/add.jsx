var React = require("react");
var app = require("../../f7app");

import navigator from "../../navigator.jsx";
import {addDish, updateDish} from "../../actions/actions.jsx";
import DishStore from "../../stores/Dish.jsx";

function prepareNutritionValue(value) {
  if(!value) {
    return "";
  }
  if(!/^[\d\.]+$/.test(value)) {
    return null;
  }
  return value;
}

class AddDishPage extends React.Component {
  constructor() {
    super();
    this.state = {
      title: "",
      carbs: "",
      proteins: "",
      fats: "",
      gi: ""
    };
  }
  componentWillMount() {
    if(this.props.id) {
      this.state = DishStore.getById(this.props.id);
    }
  }
  componentDidMount() {
    DishStore.addListener("change", this.onDishesChange);
  }
  componentWillUnmount() {
    DishStore.removeListener("change", this.onDishesChange);
  }
  onDishesChange = () => {
    navigator.navigate("/dishes");
  }
  onTitleFieldChange = (event) => {
    var value = event.target.value;
    this.setState({
      title: value
    });
  }
  onCarbsFieldChange = (event) => {
    var value = prepareNutritionValue(event.target.value);
    if(value === null) {
      return;
    }
    this.setState({
      carbs: value
    });
  }
  onProteinsFieldChange = (event) => {
    var value = prepareNutritionValue(event.target.value);
    if(value === null) {
      return;
    }
    this.setState({
      proteins: value
    });
  }
  onFatsFieldChange = (event) => {
    var value = prepareNutritionValue(event.target.value);
    if(value === null) {
      return;
    }
    this.setState({
      fats: value
    });
  }
  onGiFieldChange = (event) => {
    var value = prepareNutritionValue(event.target.value);
    if(value === null) {
      return;
    }
    this.setState({
      gi: value
    });
  }
  render() {
    return <div className="page-content">
      <div className="list-block" id="add-contact-form">
        <ul>
          <li>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title label">Название</div>
                <div className="item-input">
                    <input value={this.state.title} type="text"
                      onChange={this.onTitleFieldChange}
                      name="title" placeholder="Введите название блюда"/>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title label">Углеводы</div>
                <div className="item-input">
                  <input value={this.state.carbs} type="text"
                    name="carbs"
                    onChange={this.onCarbsFieldChange}
                    placeholder="Введите углеводы/100г"/>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title label">Белки</div>
                <div className="item-input">
                  <input type="text" name="proteins"
                    value={this.state.proteins}
                    onChange={this.onProteinsFieldChange} placeholder="Введите белки/100г"/>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title label">Жиры</div>
                <div className="item-input">
                  <input type="text" name="fats"
                    value={this.state.fats}
                    onChange={this.onFatsFieldChange} placeholder="Введите жиры/100г"/>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title label">Гликемический индекс</div>
                <div className="item-input">
                  <input type="text" name="gi"
                    value={this.state.gi}
                    onChange={this.onGiFieldChange} placeholder="Введите гликемический индекс продукта"/>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>;
  }
}

class AddDishPageNavbar extends React.Component {
  constructor() {
    super();
  }
  onDishAdd = () => {
    var data = app.formToJSON("#add-contact-form");
    try {
      if(!data.title) {
        throw new Error("Введите название");
      }
      if(!data.carbs) {
        throw new Error("Введите углеводы");
      }
      if(!data.proteins) {
        throw new Error("Введите белки");
      }
      if(!data.fats) {
        throw new Error("Введите жиры");
      }
      if(this.props.id) {
        updateDish(this.props.id, data);
      }
      else {
        addDish(data);
      }
    }
    catch(err) {
      app.alert(err.message, "Ошибка");
    }
  }
  onBackClick() {
    navigator.navigate("/dishes");
  }
  render() {
    return <div className="navbar-wrapper">
      <div className="left">
        <a href="#" className="link" onClick={this.onBackClick}>
          <i className="icon icon-back"></i>
          <span>Назад</span>
        </a>
      </div>
      <div className="center sliding">{this.props.id ? "Редактирование блюда" : "Добавление блюда"}</div>
      <div className="right">
        <a href="#" className="button button-fill color-green" onClick={this.onDishAdd}>
          {this.props.id ? "Сохранить" : "Добавить"}
        </a>
      </div>
    </div>
  }
}

module.exports = {
  page: AddDishPage,
  navbar: AddDishPageNavbar,
  title: 'Добавление/Редактирование блюда'
};