var React = require("react");
var app = require("../../f7app");
var $ = app.$;

import navigator from "../../navigator.jsx";
import {loadDishes, addServing, updateServing, fetchSettings} from "../../actions/actions.jsx";
import DishStore from "../../stores/Dish.jsx";
import ServingStore from "../../stores/Serving.jsx";
import Settings from "../../stores/Settings.jsx";
import MealStore from "../../stores/Meal.jsx";
import LoadingBox from "../../components/LoadingBox.jsx";
import {sortDishes, getCarbsInServing} from "../../util/dishes.jsx";
import {carbsToBu, buToCarbs} from "../../util/bu.jsx";
import {round} from "../../util/calc.jsx";

function calcBu(dishId, weight) {
  var dish = DishStore.getById(dishId);
  var carbs = getCarbsInServing(dish, weight);
  return carbsToBu(carbs);
}

function calcWeightByBu(dishId, bu) {
  var dish = DishStore.getById(dishId);
  var carbsin1gram = dish.carbs/100;
  return round(bu * buToCarbs(1)/carbsin1gram);
}

class AddServingPage extends React.Component {
  constructor() {
    super();
    this.state = {
      dishes: DishStore.getDishes(),
      dish_id: null,
      weight: "",
      settings: Settings.getSettings(),
      unit: "gram"
    };
  }
  componentWillMount() {
    if(this.props.id) {
      this.state.serving = ServingStore.getById(this.props.id);
      this.state.weight = this.state.serving.weight;
      if(this.state.serving && this.state.serving.dish_id) {
        this.state.dish_id = this.state.serving.dish_id;
        this.state.weightBu = calcBu(this.state.dish_id, this.state.weight);
      }
    }
    if(!this.state.dishes) {
      loadDishes();
    }
    if(!this.state.settings) {
      fetchSettings();
    }
  }
  componentDidMount() {
    DishStore.addListener("change", this.onDishesChange);
    ServingStore.addListener("change", this.onServingsChange);
    Settings.addListener("change", this.onSettingsChange);
  }
  componentWillUnmount() {
    DishStore.removeListener("change", this.onDishesChange);
    ServingStore.removeListener("change", this.onServingsChange);
    Settings.addListener("change", this.onSettingsChange);
  }
  onDishesChange = () => {
    this.setState({
      dishes: DishStore.getDishes()
    });
  }
  onServingsChange = () => {
    navigator.navigate("/calc");
  }
  onSettingsChange = () => {
    this.setState({
      settings: Settings.getSettings()
    });
  }
  onWeightFieldChange = (event) => {
    var value = event.target.value;
    value = value.replace(/[^0-9\.]/g, "");
    var updateState = {
      weight: value
    };
    if(this.state.dish_id) {
      updateState.weightBu = calcBu(this.state.dish_id, value);
    }
    this.setState(updateState);
  }
  onWeightBuFieldChange = (event) => {
    var value = event.target.value;
    value = value.replace(/[^0-9\.]/g, "");
    var updateState = {
      weightBu: value
    };
    if(this.state.dish_id) {
      updateState.weight = calcWeightByBu(this.state.dish_id, value);
    }
    this.setState(updateState);
  }
  onDishChange = () => {
    var dishId =  parseInt($("#add-serving-form [name=dish_id]").val());
    var updateState = {
      dish_id: dishId
    };
    if(this.state.weight && !this.state.weightBu) {
      updateState.weightBu = calcBu(dishId, this.state.weight);
    }
    if(!this.state.weight && this.state.weightBu) {
      updateState.weight = calcWeightByBu(dishId, this.state.weightBu);
    }
    this.setState(updateState);
  }
  onUnitChange = (unit) => {
    this.setState({
      unit
    })
  }
  render() {
    if(!this.state.dishes || !this.state.settings) {
      return <div className="page-content"><LoadingBox/></div>
    }
    var dishes = sortDishes(this.state.dishes, this.state.settings["dish-order"]);
    var dishesOptions = [];
    var currentLetter = "";
    var groupDishes = [];
    dishes.forEach((dish) => {
      let newGroup = false;
      let dishLetter = dish.title[0].toLowerCase();
      if(!currentLetter) {
        newGroup = true;
      }
      if(dishLetter != currentLetter) {
        newGroup = true;
      }
      if(newGroup) {
        if(currentLetter) {
          dishesOptions.push(<optgroup label={currentLetter.toUpperCase()}>{groupDishes}</optgroup>);
        }
        currentLetter = dishLetter;
        groupDishes = [];
      }
      groupDishes.push(<option key={dish.id} value={dish.id}>{dish.title} ({dish.carbs})</option>);
    });
    if(groupDishes.length) {
      dishesOptions.push(<optgroup label={currentLetter}>{groupDishes}</optgroup>);
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
        <ul>
          <li>
            <a href="#" className="item-link smart-select"
              data-back-on-select="true" data-searchbar="true"
              data-searchbar-placeholder="Поиск"
              data-back-text="Назад">
              <select
                onChange={this.onDishChange}
                name="dish_id"
                defaultValue={this.state.serving ? this.state.serving.dish_id : ""}
              >
                <option disabled></option>
                {dishesOptions}
              </select>
              <div className="item-content">
                <div className="item-inner">
                  <div className="item-title">Блюдо</div>
                  <div className="item-after"></div>
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