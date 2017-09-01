var app = require("../../f7app");
var React = require("react");

import DishStore from "../../stores/Dish.jsx";
import Settings from "../../stores/Settings.jsx";
import {loadDishes, fetchSettings, deleteDish} from "../../actions/actions.jsx";
import LoadingBox from "../../components/LoadingBox.jsx";
import DishListItem from "../../components/DishListItem.jsx";
import DishesPopover from "../../components/DishesPopover.jsx";
import navigator from "../../navigator.jsx";
import {sortDishes} from "../../util/dishes.jsx";
import ReactList from 'react-list';

function buildState() {
  let settings = Settings.getSettings()
  let dishes = DishStore.getDishes()
  let dishesSorted = dishes && sortDishes(dishes, settings["dish-order"])
  return {
    dishes,
    dishOrder: settings["dish-order"],
    dishesSorted
  }
}

class DishesMainPage extends React.Component {
  constructor() {
    super();
    this.state = buildState()
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
      // dishOrder wasn't changed
      return
    }
    this.setState(buildState())
  }
  onDishClicked = (dish) => {
    navigator.navigate("/dishes/" + dish.id);
  }
  onDishDelete = (dish) => {
    deleteDish(dish.id)
    app.closeSwipeout()
  }
  renderListItem = (index, key) => {
    let dish = this.state.dishesSorted[index]
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
    return <div className="page-content">
      <div className="list-block">
        {this.state.dishes ?
          <ReactList
            itemRenderer={this.renderListItem}
            itemsRenderer={this.renderList}
            length={this.state.dishesSorted.length}
            type='simple'
          />
         : <LoadingBox/>}
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
  ]
};