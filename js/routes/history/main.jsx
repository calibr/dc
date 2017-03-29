var app = require("../../f7app");
var React = require("react");

import MealHistory from "../../stores/MealHistory.jsx";
import Dish from "../../stores/Dish.jsx";
import Meal from "../../stores/Meal.jsx";
import {
  loadDishes, loadMeals
} from "../../actions/actions.jsx";
import LoadingBox from "../../components/LoadingBox.jsx";
import navigator from "../../navigator.jsx";
import MealHistoryListItem from '../../components/MealHistoryListItem.jsx'
import {visibleMonthYearDay} from '../../util/date.jsx'

class HistoryMainPage extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
    this.state = {
      mealsIds: MealHistory.getIds(),
      dishes: Dish.getDishes()
    }
    MealHistory.on("change", this.onMealHistoryChange)
    Dish.on("change", this.onDishChange)
    if(!this.state.dishes) {
      loadDishes()
    }
    if(!this.state.meals) {
      loadMeals()
    }
  }
  componentWillUnmount() {
    MealHistory.removeListener("change", this.onMealHistoryChange)
    Dish.on("change", this.onDishChange)
  }
  onDishChange = () => {
    this.setState({
      dishes: Dish.getDishes()
    })
  }
  onMealHistoryChange = () => {
    this.setState({
      mealsIds: MealHistory.getIds()
    });
  }
  render() {
    if(!this.state.mealsIds || !this.state.dishes) {
      return <div className="page-content">
        <LoadingBox/>
      </div>;
    }
    var mealListItems = []
    var lastYearMonth = ""
    var lists = []
    var currentList = []
    function buildCurrentList() {
      if(currentList.length) {
        lists.push(<div>
          <div className="month-head">{lastYearMonth}</div>
          <ul>
            {currentList}
          </ul>
        </div>)
      }
    }
    this.state.mealsIds.forEach(mealId => {
      var meal = Meal.getById(mealId)
      var yearMonth = visibleMonthYearDay(meal.date)
      if(yearMonth !== lastYearMonth) {
        buildCurrentList()
        lastYearMonth = yearMonth
        mealListItems.push(<li key={yearMonth}>{yearMonth}</li>)
      }
      currentList.push(<MealHistoryListItem key={mealId} mealId={mealId}/>)
    })
    buildCurrentList()
    return <div className="page-content history-content">
      <div className="list-block">
        {lists}
      </div>
    </div>;
  }
}

class HistoryMainPageNavBar extends React.Component {
  componentWillMount() {
  }
  componentWillUnmount() {
  }
  onSettingsSave() {
    var data = app.formToJSON("#settings-form");
    try {
      for(let k in data) {
        let v = data[k];
        if(!v) {
          throw new Error("Все значения должны быть введены");
        }
      }
      //saveSettings(data);
    }
    catch(err) {
      app.alert(err.message, "Ошибка");
    }
  }
  render() {
    return <div className="navbar-wrapper">
      <div className="center sliding">История</div>
      <div className="right">
      </div>
    </div>
  }
}

module.exports = {
  page: HistoryMainPage,
  navbar: HistoryMainPageNavBar
};