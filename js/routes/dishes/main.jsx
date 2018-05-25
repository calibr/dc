var app = require("../../f7app");
var React = require("react");
var ReactDOM = require("react-dom");

import DishStore from "../../stores/Dish.jsx";
import Settings from "../../stores/Settings.jsx";
import {loadDishes, fetchSettings, deleteDish} from "../../actions/actions.jsx";
import LoadingBox from "../../components/LoadingBox.jsx";
import DishListItem from "../../components/DishListItem.jsx";
import DishesPopover from "../../components/DishesPopover.jsx";
import navigator from "../../navigator.jsx";
import {sortDishes, filterDishesByQuery} from "../../util/dishes.jsx";
import ReactList from 'react-list'
import _ from 'lodash'

class DishesMainPage extends React.Component {
  constructor() {
    super();
    this.state = this.buildState()
    this.onSearchChangeDebounced = _.debounce(this.onSearchChange.bind(this), 200)
  }
  buildState() {
    let settings = Settings.getSettings()
    let dishes = DishStore.getDishesActive()
    let dishesSorted = dishes && sortDishes(dishes, settings["dish_order"])
    let dishesDisplayList = dishesSorted
    if(this.state && this.state.query) {
      dishesDisplayList = filterDishesByQuery(this.state.query, dishesDisplayList)
    }
    return {
      dishes,
      dishOrder: settings["dish_order"],
      dishesSorted,
      dishesDisplayList
    }
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
    app.searchbar('#dish-list-search-bar', {
      customSearch: true,
      onSearch: () => {
        this.onSearchChangeDebounced()
      }
    })
  }
  componentWillUnmount() {
    DishStore.removeListener("change", this.onDishesAvailable);
    Settings.removeListener("change", this.onSettingsChange);
  }
  onDishesAvailable = () => {
    this.setState(this.buildState());
  }
  onSettingsChange = () => {
    let settings = Settings.getSettings()
    if(settings['dish_order'] === this.state.dishOrder) {
      // dishOrder wasn't changed
      return
    }
    this.setState(this.buildState())
  }
  onDishClicked = (dish) => {
    navigator.navigate("/dishes/" + dish.id);
  }
  onDishDelete = (dish) => {
    deleteDish(dish.id)
    app.closeSwipeout()
  }
  onSearchChange() {
    let dishesDisplayList = this.state.dishesSorted
    let query = this.searchInput.value.trim()
    if(query) {
      dishesDisplayList = filterDishesByQuery(query, dishesDisplayList)
    }
    this.setState({
      query,
      dishesDisplayList
    })
  }
  onAddDish() {
    navigator.navigate("/dishes/add")
  }
  renderListItem = (index, key) => {
    let dish = this.state.dishesDisplayList[index]
    return <DishListItem
      key={dish.id}
      dish={dish}
      onDelete={this.onDishDelete.bind(null, dish)}
      onClick={this.onDishClicked.bind(null, dish)}/>;
  }
  renderList = (items, ref) => {
    return <ul className="list-bottom-margin" ref={ref}>{items}</ul>
  }
  render() {
    var dishesElems;
    let dishesList
    if(this.state.dishes) {
      if(this.state.dishes.length) {
        dishesList = <ReactList
          itemRenderer={this.renderListItem}
          itemsRenderer={this.renderList}
          length={this.state.dishesDisplayList.length}
          type='simple'
        />
      }
      else {
        dishesList = <div className="text-center">
          В списке блюд ничего нет, <a href="" onClick={this.onAddDish}>добавить</a>
        </div>
      }
    }
    else {
      dishesList = <LoadingBox/>
    }
    return <div className="page-content">
      {this.state.dishes ?
      <form id="dish-list-search-bar" className="searchbar searchbar-init">
        <div className="searchbar-input">
          <input
            ref={(input) => { this.searchInput = input; }} type="search" placeholder="Поиск"/>
          <a href="#" className="searchbar-clear"></a>
        </div>
        <a href="#" className="searchbar-cancel">Отмена</a>
      </form> : null}
      <div className="list-block">
        {dishesList}
      </div>
    </div>
  }
}

class DishesMainPageNavBar extends React.Component {
  render() {
    return <div className="navbar">
      <div className="navbar-inner">
        <div className="center sliding">Блюда</div>
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
  page: DishesMainPage,
  navbar: DishesMainPageNavBar,
  custom: [
    {
      component: DishesPopover,
      container: "#dishes-popover-content"
    }
  ],
  title: 'Блюда'
};