var React = require("react");
var app = require("../../f7app");
var $ = app.$;

import navigator from "../../navigator.jsx";
import {loadDishes, addServing, updateServing, fetchSettings} from "../../actions/actions.jsx";
import DishStore from "../../stores/Dish.jsx";
import AddServingStore from "../../stores/AddServing.jsx";
import ServingStore from "../../stores/Serving.jsx";
import Settings from "../../stores/Settings.jsx";
import MealStore from "../../stores/Meal.jsx";
import LoadingBox from "../../components/LoadingBox.jsx";
import {sortDishes, getCarbsInServing, nameFull as dishNameFull} from "../../util/dishes.jsx";
import {carbsToBu, buToCarbs} from "../../util/bu.jsx";
import {round} from "../../util/calc.jsx";
import {displayDishPicker, unitChange, weightChange, weightBuChange} from '../../actions/addServing.jsx'

function getActualState() {
  return {
    dishes: DishStore.getDishes(),
    dish_id: AddServingStore.dishId,
    weight: AddServingStore.weight,
    weightBu: AddServingStore.weightBu,
    settings: Settings.getSettings(),
    unit: AddServingStore.unit,
    serving: AddServingStore.serving
  }
}

class AddServingPage extends React.Component {
  constructor() {
    super()
    this.state = getActualState()
  }
  componentWillMount() {
    if(!this.state.dishes) {
      loadDishes();
    }
    if(!this.state.settings) {
      fetchSettings();
    }
  }
  componentDidMount() {
    AddServingStore.addListener("change", this.onServingChange);
    DishStore.addListener("change", this.onDishesChange);
    ServingStore.addListener("change", this.onServingsChange);
    Settings.addListener("change", this.onSettingsChange);
  }
  componentWillUnmount() {
    AddServingStore.removeListener("change", this.onServingChange);
    DishStore.removeListener("change", this.onDishesChange);
    ServingStore.removeListener("change", this.onServingsChange);
    Settings.removeListener("change", this.onSettingsChange);
  }
  onDishesChange = () => {
    this.setState({
      dishes: DishStore.getDishes()
    });
  }
  onServingChange = () => {
    this.setState(getActualState())
  }
  onStartPickDish = () => {
    displayDishPicker()
  }
  onServingsChange = () => {
    navigator.navigate("/calc")
  }
  onSettingsChange = () => {
    this.setState({
      settings: Settings.getSettings()
    });
  }
  onWeightFieldChange = (event) => {
    var value = event.target.value;
    value = value.replace(/[^0-9\.]/g, "");
    weightChange(value)
  }
  onWeightBuFieldChange = (event) => {
    var value = event.target.value;
    value = value.replace(/[^0-9\.]/g, "");
    weightBuChange(value)
  }
  onUnitChange = (unit) => {
    unitChange(unit)
  }
  render() {
    if(!this.state.dishes || !this.state.settings) {
      return <div className="page-content"><LoadingBox/></div>
    }
    var dish = null
    if(this.state.dish_id) {
      dish = DishStore.getById(this.state.dish_id)
    }
    var info = null;
    if(this.state.dish_id && this.state.weight) {
      var dish = DishStore.getById(this.state.dish_id);
      var carbs = getCarbsInServing(dish, this.state.weight);
      var bu = carbsToBu(carbs);
      if(this.state.unit === "gram") {
        info = <div className="text-center">
          В порции содержится <strong>{bu}</strong> ХЕ
        </div>;
      }
      else {
        info = <div className="text-center">
          Вес порции <strong>{this.state.weight}</strong> грам
        </div>;
      }
    }
    return <div className="page-content">
      <div className="list-block" id="add-serving-form">
        <input type="hidden" name="dish_id" value={this.state.dish_id}/>
        <ul>
          <li>
            <a href="#" className="item-link" onClick={this.onStartPickDish}>
              <div className="item-content">
                <div className="item-inner">
                  <div className="item-title label">Блюдо</div>
                  <div className="item-after">{dish ? dishNameFull(dish) : "Выберите блюдо"}</div>
                </div>
              </div>
            </a>
          </li>
          <li>
            <div className="item-content">
              <div className="item-inner text-center">
                <p className="buttons-row margin-auto width-50-perc">
                  <a href="#"
                    value={this.state.weight}
                    className={"button " + (this.state.unit == "gram" ? "active" : "")}
                    onClick={this.onUnitChange.bind(this, "gram")}>Граммы</a>
                  <a href="#"
                    value={this.state.weightBu}
                    className={"button " + (this.state.unit == "bu" ? "active" : "")}
                    onClick={this.onUnitChange.bind(this, "bu")}>Хлебные единицы</a>
                </p>
              </div>
            </div>
          </li>
          <li className={this.state.unit === "gram" ? "" : "display-none"}>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title label">Вес</div>
                <div className="item-input">
                  <input value={this.state.weight} type="text"
                    name="weight"
                    onChange={this.onWeightFieldChange}
                    placeholder="Введите вес (граммы)"/>
                </div>
              </div>
            </div>
          </li>
          <li className={this.state.unit === "bu" ? "" : "display-none"}>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title label">ХЕ</div>
                <div className="item-input">
                  <input value={this.state.weightBu} type="text"
                    name="weightBu"
                    onChange={this.onWeightBuFieldChange}
                    placeholder="Введите нужное количество ХЕ"/>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      {info}
    </div>;
  }
}

class AddServingPageNavbar extends React.Component {
  constructor() {
    super();
  }
  onServingAdd = () => {
    var data = app.formToJSON("#add-serving-form");
    try {
      if(!data.dish_id) {
        throw new Error("Выберите блюдо");
      }
      if(this.props.id) {
        updateServing(this.props.id, data);
      }
      else {
        let activeMeal = MealStore.getActive();
        data.meal_id = activeMeal.id;
        addServing(data);
      }
    }
    catch(err) {
      app.alert(err.message, "Ошибка");
    }
  }
  onBackClick() {
    navigator.navigate("/calc");
  }
  render() {
    return <div className="navbar-wrapper">
      <div className="left">
        <a href="#" className="link" onClick={this.onBackClick}>
          <i className="icon icon-back"></i>
          <span>Назад</span>
        </a>
      </div>
      <div className="center sliding">{this.props.id ? "Редактирование порции" : "Добавление порции"}</div>
      <div className="right">
        <a href="#" className="button button-fill color-green" onClick={this.onServingAdd}>
          {this.props.id ? "Сохранить" : "Добавить"}
        </a>
      </div>
    </div>
  }
}

module.exports = {
  page: AddServingPage,
  navbar: AddServingPageNavbar
};