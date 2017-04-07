var app = require("../../f7app");
var React = require("react");

import Meal from "../../stores/Meal.jsx";
import Dish from "../../stores/Dish.jsx";
import Settings from "../../stores/Settings.jsx";
import Serving from "../../stores/Serving.jsx";
import {
  fetchActiveMeal, createMeal, fetchServings, loadDishes, deleteServing,
  endMeal, fetchSettings, setMealCoef, updateServing
} from "../../actions/actions.jsx";
import LoadingBox from "../../components/LoadingBox.jsx";
import navigator from "../../navigator.jsx";
import ServingListItem from "../../components/ServingListItem.jsx";
import {calc} from "../../util/calc.jsx";
import {getCurrentCoefName} from "../../util/coef.jsx";
import {carbsToBu} from "../../util/bu.jsx";

class CalcMainPage extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
    this.state = {
      activeMeal: Meal.getActive(),
      servings: Meal.getActive() && Serving.getForMeal(Meal.getActive().id),
      dishes: Dish.getDishes(),
      settings: Settings.getSettings()
    };
    if(typeof this.state.activeMeal === "undefined") {
      fetchActiveMeal();
    }
    if(!this.state.dishes) {
      loadDishes();
    }
    if(!this.state.settings) {
      fetchSettings();
    }
    Meal.on("change", this.onMealChange);
    Dish.on("change", this.onDishChange);
    Serving.on("change", this.onServingChange);
    Settings.on("change", this.onSettingsChange);
  }
  componentWillUnmount() {
    Meal.removeListener("change", this.onMealChange);
    Serving.removeListener("change", this.onServingChange);
    Dish.removeListener("change", this.onDishChange);
    Settings.removeListener("change", this.onSettingsChange);
  }
  onMealChange = () => {
    var activeMeal = Meal.getActive();
    var newState = {
      activeMeal: activeMeal
    };
    if(!activeMeal && this.state.servings) {
      newState.servings = null;
    }
    this.setState(newState);
  }
  onDishChange = () => {
    this.setState({
      dishes: Dish.getDishes()
    });
  }
  onServingChange = () => {
    this.setState({
      servings: Meal.getActive() && Serving.getForMeal(Meal.getActive().id)
    });
  }
  onSettingsChange = () => {
    this.setState({
      settings: Settings.getSettings()
    });
  }
  onCreateMeal = () => {
    createMeal({
      coef: this.state.settings[getCurrentCoefName()]
    });
  }
  onServingClick = (serving) => {
    navigator.navigate("/calc/servings/" + serving.id);
  }
  onServingDelete = (serving) => {
    deleteServing(serving.id);
    app.closeSwipeout()
  }
  onServingAte = (serving) => {
    updateServing(serving.id, {
      eaten: true
    });
    app.closeSwipeout()
  }
  onServingDidntEat = (serving) => {
    updateServing(serving.id, {
      eaten: false
    });
    app.closeSwipeout()
  }
  onMealEnd = () => {
    endMeal(this.state.activeMeal.id);
  }
  render() {
    if(typeof this.state.activeMeal === "undefined" || !this.state.settings) {
      fetchActiveMeal();
      return <div className="page-content">
        <LoadingBox/>
      </div>;
    }
    if(!this.state.activeMeal) {
      return <div className="page-content">
        <div className="content-block">
          <p><a onClick={this.onCreateMeal} href="#" className="button button-big button-round active">Создать список</a></p>
        </div>
      </div>;
    }
    if(!this.state.servings) {
      fetchServings({
        meal_id: this.state.activeMeal.id
      });
      return <div className="page-content">
        <LoadingBox/>
      </div>;
    }

    var servingsToEat = []
    var servingsEaten = []
    this.state.servings.forEach(serving => {
      if(serving.eat_date) {
        servingsEaten.push(<ServingListItem
          onClick={this.onServingClick.bind(this, serving)}
          onDelete={this.onServingDelete.bind(this, serving)}
          onAte={this.onServingDidntEat.bind(this, serving)}
          ateText="Не съел"
          key={serving.id} serving={serving}/>)
      }
      else {
        servingsToEat.push(<ServingListItem
          onClick={this.onServingClick.bind(this, serving)}
          onDelete={this.onServingDelete.bind(this, serving)}
          onAte={this.onServingAte.bind(this, serving)}
          key={serving.id} serving={serving}/>)
      }
    })

    var carbs = this.state.servings.reduce((prev, serving) => {
      var dish = Dish.getById(serving.dish_id);
      return dish.carbs * serving.weight/100 + prev;
    }, 0)
    var dose = calc(carbs, this.state.activeMeal.coef)
    var totalBu = carbsToBu(carbs)
    return <div className="page-content">
      {servingsToEat.length ?
        <div className="list-block">
          <ul>{servingsToEat}</ul>
        </div>
        : null
      }
      {servingsEaten.length ?
        <div>
          <div className="content-block-title">Съедено:</div>
          <div className="list-block servings-eaten">
            <ul>{servingsEaten}</ul>
          </div>
        </div>
        : null
      }
      {this.state.servings.length ?
        <div>
          <div className="content-block">
            <div className="insulin-dose">Доза инсулина: {dose}</div>
            <div className="text-center">Всего ХЕ: {totalBu}</div>
          </div>
        </div>
        : null
      }
      <div className="content-block text-center">
        {this.state.activeMeal ? <a href="#" className="button button-fill color-red" onClick={this.onMealEnd}>
          Закончить еду
        </a> : null}
      </div>
    </div>
  }
}

class CalcMainPageNavBar extends React.Component {
  componentWillMount() {
    this.state = {
      activeMeal: Meal.getActive()
    };
    Meal.on("change", this.onMealChange);
  }
  componentWillUnmount() {
    Meal.removeListener("change", this.onMealChange);
  }
  onMealChange = () => {
    this.setState({
      activeMeal: Meal.getActive()
    });
  }
  onServingAdd() {
    navigator.navigate("/calc/servings/add");
  }
  render() {
    return <div className="navbar-wrapper">
      <div className="left">
        {this.state.activeMeal ?
          <a href="#" className="link open-popover" data-popover=".popover-calc-select-meal-coef">
            K = {this.state.activeMeal.coef}
          </a> : null}
      </div>
      <div className="center sliding">Рассчет дозы</div>
      <div className="right">
        {this.state.activeMeal ? <a href="#" className="button button-fill color-green" onClick={this.onServingAdd}>
          + порция
        </a> : null}
      </div>
    </div>
  }
}

class SelectCoefPopover extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
    this.state = {
      settings: Settings.getSettings(),
      activeMeal: Meal.getActive()
    };
    if(!this.state.settings) {
      fetchSettings();
    }
    Settings.on("change", this.onSettingsChange);
    Meal.on("change", this.onMealChange);
  }
  componentWillUnmount() {
    Settings.removeListener("change", this.onSettingsChange);
    Meal.removeListener("change", this.onMealChange);
  }
  onMealChange = () => {
    this.setState({
      activeMeal: Meal.getActive()
    });
  }
  onSelectCoef = (coef) => {
    setMealCoef(this.state.activeMeal.id, coef);
    app.closeModal();
  }
  onSettingsChange = () => {
    this.setState({
      settings: Settings.getSettings()
    });
  }
  render() {
    if(!this.state.settings) {
      return null;
    }
    return <ul>
      <li><a href="#"
        className="list-button item-link"
        onClick={this.onSelectCoef.bind(this, this.state.settings["morning-coef"])}>
        Утренний коэффициент ({this.state.settings["morning-coef"]})
      </a></li>
      <li><a href="#"
        className="list-button item-link"
        onClick={this.onSelectCoef.bind(this, this.state.settings["day-coef"])}>
        Дневной коэффициент ({this.state.settings["day-coef"]})
      </a></li>
      <li><a href="#"
        className="list-button item-link"
        onClick={this.onSelectCoef.bind(this, this.state.settings["evening-coef"])}>
        Вечерний коэффициент ({this.state.settings["evening-coef"]})
      </a></li>
      <li><a href="#"
        className="list-button item-link"
        onClick={this.onSelectCoef.bind(this, this.state.settings["night-coef"])}>
        Ночной коэффициент ({this.state.settings["night-coef"]})
      </a></li>
    </ul>;
  }
}

module.exports = {
  page: CalcMainPage,
  navbar: CalcMainPageNavBar,
  custom: [
    {
      component: SelectCoefPopover,
      container: "#select-meal-coef-popover-content"
    }
  ]
};