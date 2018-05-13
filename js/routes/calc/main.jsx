var app = require("../../f7app");
var React = require("react");

import moment from 'moment'
import Meal from "../../stores/Meal.jsx";
import Dish from "../../stores/Dish.jsx";
import Settings from "../../stores/Settings.jsx";
import Serving from "../../stores/Serving.jsx";
import {
  fetchActiveMeal, createMeal, fetchServings, loadDishes, deleteServing,
  endMeal, fetchSettings, setMealCoef, updateServing
} from "../../actions/actions.jsx";
import {display as displayAddServing} from "../../actions/addServing.jsx";
import {addTreatment} from "../../actions/nightscout.jsx";
import {display as displayStt} from "../../actions/stt.jsx";
import {addServingFromSTT} from "../../actions/servings.jsx";
import LoadingBox from "../../components/LoadingBox.jsx";
import navigator from "../../navigator.jsx";
import ServingListItem from "../../components/ServingListItem.jsx";
import {calc} from "../../util/calc.jsx";
import {
  getCurrentCoef, unpack as unpackCoef, pack as packCoef,
  getCoefsFromSettings
} from "../../util/coef.jsx";
import {carbsToBu} from "../../util/bu.jsx";
import {hour2} from '../../util/date.jsx'
import {getCarbsInServing} from '../../util/dishes.jsx'
import {SpeechToText} from '../../util/stt/speechToText.jsx'

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
    let coefs = getCoefsFromSettings(this.state.settings)
    let k = getCurrentCoef(coefs)
    createMeal({
      coef: k
    });
  }
  onServingClick = (serving) => {
    displayAddServing(serving.id)
  }
  onServingDelete = (serving) => {
    deleteServing(serving.id);
    app.closeSwipeout()
  }
  onServingAte = (serving) => {
    updateServing(serving.id, {
      eaten: true
    })
    let dish = Dish.getById(serving.dish_id)
    addTreatment({
      carbs: getCarbsInServing(dish, serving.weight),
      notes: dish.title,
      sysTime: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZZ')
    })
    app.closeSwipeout()
  }
  onServingDidntEat = (serving) => {
    updateServing(serving.id, {
      eaten: false
    });
    app.closeSwipeout()
  }
  onMealEnd = () => {
    var end = () => {
      endMeal(this.state.activeMeal.id);
    }
    if(this.state.servings.length) {
      var uneaten = this.state.servings.filter(s => !s.eat_date)
      if(uneaten.length) {
        return app.confirm(
          'В списке имеются не съеденные блюда, для улучшения качества истории желательно помечать все блюда как съеденные или удалять не съеденные, хотите закончить еду?',
          'Важно!', function() {
            end()
          }
        )
      }
    }
    end()
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
    if(!this.state.dishes) {
      return <div className="page-content">
        <LoadingBox/>
      </div>
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
          coef={this.state.activeMeal.coef}
          key={serving.id} serving={serving}/>)
      }
      else {
        servingsToEat.push(<ServingListItem
          onClick={this.onServingClick.bind(this, serving)}
          onDelete={this.onServingDelete.bind(this, serving)}
          onAte={this.onServingAte.bind(this, serving)}
          coef={this.state.activeMeal.coef}
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
            <div className="insulin-dose">Доза инсулина: {dose}U</div>
            <div className="text-center">Всего углеводов: {carbs.toFixed(2)}г. или {totalBu}ХЕ</div>
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
    displayAddServing()
  }
  onVoiceAdd() {
    displayStt({
      callback: addServingFromSTT,
      returnTo: '/calc'
    })
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
        {this.state.activeMeal ?
          <p className="row">
            {
              window.webkitSpeechRecognition ?
                <a href="#" className="button button-fill color-red" onClick={this.onVoiceAdd}>голос</a>
                :
                null
            }
            <a href="#" className="button button-fill color-green" onClick={this.onServingAdd}>+ порция</a>
          </p> : null}
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
    var coefs = []
    for(let setting in this.state.settings) {
      let coef = unpackCoef(setting)
      if(coef) {
        coef.k = this.state.settings[setting]
        coefs.push(coef)
      }
    }
    coefs.sort((c1, c2) => {
      return c1.from - c2.from
    })

    let coefElems = coefs.map(coef => <li key={packCoef(coef.from, coef.to)}><a href="#"
        className="list-button item-link"
        onClick={this.onSelectCoef.bind(this, coef.k)}>
        С {hour2(coef.from)} по {hour2(coef.to)} ({coef.k})
      </a></li>)

    return <ul>
      {coefElems}
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