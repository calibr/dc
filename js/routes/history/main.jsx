var app = require("../../f7app");
var React = require("react");

import MealHistory from "../../stores/MealHistory.jsx";
import Dish from "../../stores/Dish.jsx";
import Meal from "../../stores/Meal.jsx";
import Serving from "../../stores/Serving.jsx";
import {
  loadDishes, loadMeals
} from "../../actions/actions.jsx";
import LoadingBox from "../../components/LoadingBox.jsx";
import navigator from "../../navigator.jsx";
import MealHistoryListItem from '../../components/MealHistoryListItem.jsx'
import {visibleMonthYearDay} from '../../util/date.jsx'
import {getCarbsInServing} from '../../util/dishes.jsx'
import {carbsToBu} from '../../util/bu.jsx'
import InfiniteScroll from '../../components/InfiniteScroll.jsx'
import HistoryPopover from "../../components/HistoryPopover.jsx"

// it is approximate because the server will return full meals list for every day. we
// can't return partial list because if so summary information about a day might be incorrect
const minMealsPerLoad = 20

class HistoryMainPage extends React.Component {
  constructor() {
    super()
    this.state = {
      mealsIds: MealHistory.getIds(),
      dishes: Dish.getDishes(),
      loadMealsTag: null,
      allMealsLoaded: false
    }
    this.onPreload = this.onPreload.bind(this)
  }
  componentWillMount() {
    MealHistory.on("change", this.onMealHistoryChange)
    Dish.on("change", this.onDishChange)
    if(!this.state.dishes) {
      loadDishes()
    }
    if(!this.state.mealsIds) {
      this.onPreload()
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
  onMealHistoryChange = data => {
    let stateUpd = {
      mealsIds: MealHistory.getIds()
    }
    if(data.tag === this.state.loadMealsTag) {
      stateUpd.loading = false
      if(
        this.state.mealsIds && MealHistory.countMeals() === this.state.mealsIds.length ||
        typeof this.state.mealsIds === 'undefined' && MealHistory.countMeals() === 0
      ) {
        stateUpd.allMealsLoaded = true
      }
    }
    this.setState(stateUpd)
  }
  totalCarbsForMeal = (mealId) => {
    let carbs = 0
    var servings = Serving.getForMeal(mealId)
    if(!servings) {
      return carbs
    }
    for(let serving of servings) {
      let dish = Dish.getById(serving.dish_id)
      if(!dish) {
        continue
      }
      let carbsInServing = getCarbsInServing(dish, serving.weight)
      carbs += carbsInServing
    }
    return carbs
  }
  onPreload() {
    let tag = loadMeals({
      offset: MealHistory.countMeals(),
      limit: minMealsPerLoad,
      timeZoneOffset: new Date().getTimezoneOffset(),
      doNotCut: true
    })
    this.setState({loading: true, loadMealsTag: tag})
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
        lists.push(<div key={"list-" + lastYearMonth}>
          <div className="month-head">{lastYearMonth}</div>
          <div className="month-head-2">Всего ХЕ <strong>{carbsToBu(dayCarbs)}</strong></div>
          <div className="list-block accordion-list">
            <ul>
              {currentList}
            </ul>
          </div>
        </div>)
      }
    }
    let dayCarbs = 0
    this.state.mealsIds.forEach(mealId => {
      var meal = Meal.getById(mealId)
      var yearMonth = visibleMonthYearDay(meal.date)
      if(!lastYearMonth) {
        lastYearMonth = yearMonth
      }
      if(yearMonth !== lastYearMonth) {
        buildCurrentList()
        lastYearMonth = yearMonth
        currentList = []
        dayCarbs = 0
      }
      dayCarbs += this.totalCarbsForMeal(mealId)
      currentList.push(<MealHistoryListItem key={mealId} mealId={mealId}/>)
    })
    buildCurrentList()
    if(lists.length === 0) {
      lists = <div className="list-block">
        <div className="text-center">
          История не содержит записей приемов пищи
        </div>
      </div>
    }
    return <div className="page-content history-content">
      <InfiniteScroll loading={this.state.loading} fullfilled={this.state.allMealsLoaded} preloadThreshold={0.5} onNeedPreload={this.onPreload}>
        {lists}
      </InfiniteScroll>
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
    }
    catch(err) {
      app.alert(err.message, "Ошибка");
    }
  }
  render() {
    return <div className="navbar-wrapper">
      <div className="center sliding">История</div>
      <div className="right">
        <a href="#" className="link open-popover" data-popover=".popover-history">
          <i className="icon icon-bars"></i>
        </a>
      </div>
    </div>
  }
}

module.exports = {
  page: HistoryMainPage,
  navbar: HistoryMainPageNavBar,
  custom: [
    {
      component: HistoryPopover,
      container: "#history-popover-content"
    }
  ],
  title: 'История'
};