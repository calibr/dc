var React = require("react");
import Dish from '../stores/Dish.jsx'
import Meal from '../stores/Meal.jsx'
import Serving from '../stores/Serving.jsx'
import {visibleTime as getVisibleTime} from '../util/date.jsx'
import {getCarbsInServing} from '../util/dishes.jsx'
import {carbsToBu} from '../util/bu.jsx'

class MealHistoryListItem extends React.Component {
  render() {
    var mealId = this.props.mealId;
    var meal = Meal.getById(mealId)
    var servings = Serving.getForMeal(mealId)
    var carbs = 0
    if(servings) {
      for(let serving of servings) {
        var dish = Dish.getById(serving.dish_id)
        if(dish) {
          carbs += getCarbsInServing(dish, serving.weight)
        }
        else {
          // can't calculate actual carbs amount, don't display it
          carbs = 0
          break
        }
      }
    }

    return <li>
      <a onClick={this.props.onClick} className="item-content item-link">
        <div className="item-inner">
          <div className="item-title">
            {getVisibleTime(meal.date)} - {getVisibleTime(meal.date_end)}, Коэффициент {meal.coef}
          </div>
          <div className="item-after"><span className="badge">{carbsToBu(carbs)} ХЕ</span></div>
        </div>
      </a>
    </li>;
  }
}

export default MealHistoryListItem;