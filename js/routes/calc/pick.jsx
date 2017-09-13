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
import ReactList from 'react-list';
import _ from 'lodash'
import escapeRegexp from 'escape-string-regexp'

function buildState() {
  let settings = Settings.getSettings()
  let dishes = DishStore.getDishes()
  let dishesSorted = dishes && settings && sortDishes(dishes, settings["dish-order"])
  return {
    dishes,
    dishOrder: settings['dish-order'],
    dishesSorted,
    dishesDisplayList: dishesSorted
  }
}

class DishesPickPage extends React.Component {
  constructor() {
    super();
    this.state = buildState()
    this.onSearchChangeDebounced = _.debounce(this.onSearchChange.bind(this), 200)
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
    app.searchbar('#dish-picker-search-bar', {
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
    this.setState(buildState());
  }
  onSettingsChange = () => {
    let settings = Settings.getSettings()
    if(settings['dish-order'] === this.state.dishOrder) {
      // ignore settings change, it didn't affect dish order
      return
    }
    this.setState(buildState())
  }
  onDishClicked = (dish) => {
    pickDish(dish.id)
  }
  onSearchChange() {
    let dishesDisplayList = this.state.dishesSorted
    let query = this.searchInput.value.trim()
    query = escapeRegexp(query)
    query = query.replace(/\s+/, "\\s+")
    let regexp = new RegExp('(?:^|[\\s-])' + query, 'i')
    if(query) {
      // filter dishes by query
      dishesDisplayList = []
      for(let dish of this.state.dishesSorted) {
        if(regexp.test(dish.title)) {
          dishesDisplayList.push(dish)
        }
      }
    }
    this.setState({
      query,
      dishesDisplayList
    })
  }
  renderListItem = (index, key) => {
    let dish = this.state.dishesDisplayList[index]
    return <DishListItem
      key={dish.id}
      dish={dish}
      onClick={this.onDishClicked.bind(null, dish)}/>;
  }
  renderList = (items, ref) => {
    return <ul className="list-bottom-margin" id="dish-list-to-pick" ref={ref}>{items}</ul>
  }
  render() {
    let dishesContainer = null
    if(this.state.dishes) {
      dishesContainer = <ReactList
        itemRenderer={this.renderListItem}
        itemsRenderer={this.renderList}
        length={this.state.dishesDisplayList.length}
        type='simple'
      />
    }
    else {
      dishesContainer = <LoadingBox/>
    }

    return <div className="page-content">
      <form id="dish-picker-search-bar" className="searchbar searchbar-init">
        <div className="searchbar-input">
          <input
            ref={(input) => { this.searchInput = input; }} type="search" placeholder="Поиск"/>
          <a href="#" className="searchbar-clear"></a>
        </div>
        <a href="#" className="searchbar-cancel">Отмена</a>
      </form>
      <div className="list-block">
        {dishesContainer}
      </div>
    </div>
  }
}

class DishesPickPageNavBar extends React.Component {
  onBackClick() {
    navigator.back()
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
          <a href="#" className="link open-popover" data-popover=".popover-pick">
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
      container: "#pick-popover-content"
    }
  ]
};