var app = require("../../f7app");
var React = require("react");

import DishStore from "../../stores/Dish.jsx";
import Settings from "../../stores/Settings.jsx";
import {loadDishes, fetchSettings} from "../../actions/actions.jsx";
import LoadingBox from "../../components/LoadingBox.jsx";
import DishListItem from "../../components/DishListItem.jsx";
import DishesPopover from "../../components/DishesPopover.jsx";
import navigator from "../../navigator.jsx";
import {sortDishes} from "../../util/dishes.jsx";

class DishesMainPage extends React.Component {
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
    navigator.navigate("/dishes/" + dish.id);
  }
  render() {
    var dishesElems;
    if(this.state.dishes && this.state.settings) {
      let dishes = sortDishes(this.state.dishes, this.state.settings["dish-order"]);
      dishesElems = dishes.map((dish) => {
        return <DishListItem key={dish.id} dish={dish} onClick={this.onDishClicked.bind(null, dish)}/>;
      });
    }
    return <div className="page-content">
      <div className="list-block">
        {this.state.dishes ? <ul>{dishesElems}</ul> : <LoadingBox/>}
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