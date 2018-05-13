var React = require("react");
var app = require("../../f7app");
const uuidV4 = require('uuid/v4');

import navigator from "../../navigator.jsx";
import {addDish} from "../../actions/actions.jsx";
import {display as displayStt} from "../../actions/stt.jsx";
import {addSubDish, changeSubDish, changeTitle, deleteSubDish, changeTotalWeight} from "../../actions/addComplexDish.jsx";
import DishStore from "../../stores/Dish.jsx";
import AddComplexDishStore from "../../stores/AddComplexDish.jsx";
import Settings from "../../stores/Settings.jsx";
import {sortDishes, getCarbsInServing, getProteinsInServing, getFatsInServing} from "../../util/dishes.jsx";
import LoadingBox from "../../components/LoadingBox.jsx";
import SubDish from "../../components/SubDish.jsx";
import {round} from "../../util/calc.jsx";
import {display as displayDishPicker} from '../../actions/dishPicker.jsx'

function getActualState() {
  return {
    subDishes: AddComplexDishStore.subDishes,
    title: AddComplexDishStore.title,
    totalWeight: AddComplexDishStore.totalWeight,
    dishes: DishStore.getDishes(),
    settings: Settings.getSettings()
  }
}

class AddComplexDishPage extends React.Component {
  constructor() {
    super()
    this.state = getActualState()
  }
  componentWillMount() {
    if(this.props.id) {
      this.state = DishStore.getById(this.props.id);
    }
  }
  componentDidMount() {
    DishStore.addListener("change", this.onDishesChange);
    AddComplexDishStore.addListener("change", this.onComplexDishChange);
  }
  componentWillUnmount() {
    DishStore.removeListener("change", this.onDishesChange);
    AddComplexDishStore.removeListener("change", this.onComplexDishChange);
  }
  onComplexDishChange = () => {
    this.setState(getActualState())
  }
  onDishesChange = () => {
    this.setState({
      dishes: DishStore.getDishes()
    });
  }
  onSubDishChange = (index, data) => {
    let uuid = this.state.subDishes[index].uuid
    data.uuid = uuid
    changeSubDish(data)
  }
  onSubDishDelete = (index) => {
    var subDishes = this.state.subDishes;
    let uuid = subDishes[index].uuid
    deleteSubDish(uuid)
  }
  onSubDishAdd = () => {
    addSubDish()
  }
  onVoiceAdd = () => {
    displayStt({
      view: 'dishes',
      returnTo: '/dishes/addComplex',
      callback: (dish) => {
        addSubDish({
          dishId: dish.dish_id,
          weight: dish.weight
        })
      }
    })
  }
  onTitleFieldChange = (event) => {
    var value = event.target.value;
    changeTitle(value)
  }
  onTotalWeightChange = (event) => {
    var value = event.target.value;
    value = value.replace(/[^0-9\.]/g, "");
    var updateState = {
      totalWeight: value
    };
    changeTotalWeight(value)
  }
  render() {
    if(!this.state.dishes || !this.state.settings) {
      return <div className="page-content"><LoadingBox/></div>
    }
    var dishes = sortDishes(this.state.dishes, this.state.settings["dish-order"]);
    var info = null;
    var subDishesElems = [];
    for(let i = 0; i != this.state.subDishes.length; i++) {
      let subDish = this.state.subDishes[i]
      let subDishElem = <SubDish
        key={"subdish_" + subDish.uuid}
        title={"Ингредиент \#" + (i + 1)}
        uuid={subDish.uuid}
        dishId={subDish.dishId}
        weight={subDish.weight}
        onChange={this.onSubDishChange.bind(this, i)}
        onDelete={this.onSubDishDelete.bind(this, i)}
        />;
      subDishesElems.push(subDishElem);
    }
    return <div className="page-content">
      <div id="add-dish-form">
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
          </ul>
        </div>
        {subDishesElems}
        <div className="content-block text-center row flex-buttons">
          {
            window.webkitSpeechRecognition ?
              <button href="#" className="col button button-fill color-red" onClick={this.onVoiceAdd}>голос</button>
              :
              null
          }
          <button href="#" className="col button button-fill color-green" onClick={this.onSubDishAdd}>
            + ингредиент
          </button>
        </div>
        <div className="list-block" id="add-contact-form">
          <ul>
            <li>
              <div className="item-content">
                <div className="item-inner">
                  <div className="item-title label">Конечный вес продукта</div>
                  <div className="item-input">
                      <input value={this.state.totalWeight} type="text"
                        onChange={this.onTotalWeightChange}
                        name="total_weight" placeholder="Введите вес в граммах"/>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      {info}
    </div>;
  }
}

class AddComplexDishPageNavbar extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() {
    DishStore.addListener("added", this.onDishAdded);
  }
  componentWillUnmount() {
    DishStore.removeListener("added", this.onDishAdded);
  }
  onDishAdded = (data) => {
    if(data.tag === this.state.tag) {
      navigator.navigate("/dishes");
    }
  }
  onDishAdd = () => {
    var data = app.formToJSON("#add-dish-form");
    try {
      if(!data.title) {
        throw new Error("Введите название");
      }
      if(!data.total_weight || data.total_weight == 0) {
        throw new Error("Введите конечный вес");
      }
      var subDishElems = document.getElementById("add-dish-form").querySelectorAll(".sub-dish");
      var subDishes = [];
      for(let subDishElem of subDishElems) {
        let dishId = parseInt(subDishElem.querySelector(".dishId").value);
        let weight = parseFloat(subDishElem.querySelector(".dishWeight").value);
        if(!dishId || !weight) {
          console.log("dishId or/and weight is empty", dishId, weight, "ignore dish");
          continue;
        }
        subDishes.push({
          dishId,
          weight
        });
      }
      var carbsTotal = 0;
      var fatsTotal = 0;
      var proteinsTotal = 0;
      if(!subDishes.length) {
        throw new Error("Не задан ни один ингредиент");
      }
      var dishesTotalWeight = 0;
      var giSum = 0;
      for(let subDish of subDishes) {
        let dish = DishStore.getById(subDish.dishId);
        if(!dish) {
          console.log("Dish with ID %d not found", subDish.dishId);
          continue;
        }
        carbsTotal += getCarbsInServing(dish, subDish.weight);
        fatsTotal += getFatsInServing(dish, subDish.weight);
        proteinsTotal += getProteinsInServing(dish, subDish.weight);
        dishesTotalWeight += subDish.weight;
        giSum += dish.gi * subDish.weight;
      }
      var carbs = round(carbsTotal/data.total_weight * 100);
      var fats = round(fatsTotal/data.total_weight * 100);
      var proteins = round(proteinsTotal/data.total_weight * 100);
      var gi = Math.round(giSum/dishesTotalWeight);
      var tag = uuidV4();
      addDish({
        title: data.title,
        carbs,
        fats,
        proteins,
        gi,
        complex_data: JSON.stringify({
          subDishes,
          totalWeight: data.total_weight
        })
      }, {tag});
      this.setState({tag});
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
      <div className="center sliding">Добавление сложного блюда</div>
      <div className="right">
        <a href="#" className="button button-fill color-green" onClick={this.onDishAdd}>
          Добавить
        </a>
      </div>
    </div>
  }
}

module.exports = {
  page: AddComplexDishPage,
  navbar: AddComplexDishPageNavbar
};