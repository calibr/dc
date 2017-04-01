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
    var servingsRows = []
    if(servings) {
      for(let serving of servings) {
        var dish = Dish.getById(serving.dish_id)
        if(dish) {
          let carbsInServing = getCarbsInServing(dish, serving.weight)
          carbs += carbsInServing
          servingsRows.push(<tr key={"serving-" + serving.id}>
            <td>{dish.title}</td>
            <td>{serving.weight} г.</td>
            <td>{carbsInServing} г.</td>
            <td>{carbsToBu(carbsInServing)} ХЕ</td>
          </tr>)
        }
        else {
          // can't calculate actual carbs amount, don't display it
          carbs = 0
          break
        }
      }
    }

    return <li className="accordion-item">
      <a onClick={this.props.onClick} className="item-content item-link">
        <div className="item-inner">
          <div className="item-title">
            {getVisibleTime(meal.date)} - {getVisibleTime(meal.date_end)}, Коэффициент {meal.coef}
          </div>
          <div className="item-after"><span className="badge">{carbsToBu(carbs)} ХЕ</span></div>
        </div>
      </a>
      <div className="accordion-item-content">
        <div className="content-block">
          <table>
            <thead>
              <tr>
                <th>Блюдо</th>
                <th>Вес порции</th>
                <th>Углеводов в порции</th>
                <th>ХЕ в порции</th>
              </tr>
            </thead>
            <tbody>
              {servingsRows}
            </tbody>
          </table>
        </div>
      </div>
    </li>;
  }
}

export default MealHistoryListItem;