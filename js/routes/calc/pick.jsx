var app = require("../../f7app");
var React = require("react");

import DishStore from "../../stores/Dish.jsx";
import Settings from "../../stores/Settings.jsx";
import {loadDishes, fetchSettings, deleteDish} from "../../actions/actions.jsx";
import {pickDish} from "../../actions/dishPicker.jsx";
import LoadingBox from "../../components/LoadingBox.jsx";
import {DishesPopoverShort} from "../../components/DishesPopover.jsx";
import DishListItem from "../../components/DishListItem.jsx";
import navigator from "../../navigator.jsx";
import {sortDishes} from "../../util/dishes.jsx";

class DishesPickPage extends React.Component {
  constructor() {
    super();
    this.state = {
      dishes: DishStore.getDishes(),
      settings: Settings.getSettings()
    };
  }
  componentDidMount() {
    DishStore.on("change", this.onDishesAvailable);
    Settings.on("change", this.onSettingsChange);
    if(!DishStore.getDishes()) {
      loadDishes();
    }
    if(!this.state.settings) {
      fetchSettings();
    }
    this.searchInput.focus()
    console.log(this.searchInput)
  }
  componentWillUnmount() {
    DishStore.removeListener("change", this.onDishesAvailable);
    Settings.removeListener("change", this.onSettingsChange);
  }
  onDishesAvailable = () => {
    this.setState({
      dishes: DishStore.getDishes()
    });
  }
  onSettingsChange = () => {
    this.setState({
      settings: Settings.getSettings()
    });
  }
  onDishClicked = (dish) => {
    pickDish(dish.id)
  }
  render() {
    var dishesElems;
    if(this.state.dishes && this.state.settings) {
      let dishes = sortDishes(this.state.dishes, this.state.settings["dish-order"]);
      dishesElems = dishes.map((dish) => {
        if(dish.deleted) {
          return null
        }
        return <DishListItem
          key={dish.id}
          dish={dish}
          onClick={this.onDishClicked.bind(null, dish)}/>;
      })
    }
    return <div className="page-content">
      <form className="searchbar searchbar-init" data-search-list="#dish-list-to-pick" data-search-in=".item-title">
        <div className="searchbar-input">
          <input ref={(input) => { this.searchInput = input; }} type="search" placeholder="Поиск"/>
          <a href="#" className="searchbar-clear"></a>
        </div>
        <a href="#" className="searchbar-cancel">Cancel</a>
      </form>
      <div className="list-block">
        {this.state.dishes ? <ul id="dish-list-to-pick">{dishesElems}</ul> : <LoadingBox/>}
      </div>
    </div>
  }
}

class DishesPickPageNavBar extends React.Component {
  onBackClick() {
    navigator.navigate("/calc");
  }
  render() {
    return <div className="navbar">
      <div className="navbar-inner">
        <div className="left">
          <a href="#" className="link" onClick={this.onBackClick}>
            <i className="icon icon-back"></i>
            <span>Назад</span>
          </a>
        </div>
        <div className="center sliding">Выбор Блюда</div>
        <div className="right">
          <a href="#" className="link open-popover" data-popover=".popover-dishes">
            <i className="icon icon-bars"></i>
          </a>
        </div>
      </div>
    </div>
  }
}

module.exports = {
  page: DishesPickPage,
  navbar: DishesPickPageNavBar,
  custom: [
    {
      component: DishesPopoverShort,
      container: "#dishes-popover-content"
    }
  ]
};