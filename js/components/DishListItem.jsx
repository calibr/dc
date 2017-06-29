var React = require("react");

import AbstractSwipeOut from './AbstractSwipeOut.jsx'
import {visibleRel} from '../util/date.jsx'

class DishListItem extends AbstractSwipeOut {
  onSwipeOutDelete = () => {
    if(this.props.onDelete) {
      this.props.onDelete()
    }
  }
  render() {
    var dish = this.props.dish;
    return <li className="swipeout dish-list-item">
      <a onClick={this.onClick} className="swipeout-content item-content item-link">
        <div className="item-inner">
          <div className="item-title">
            {dish.title} {dish.is_complex ? <span className="extra-title">{visibleRel(dish.date)}</span> : null}
          </div>
          <div className="item-after"><span className="badge">{dish.carbs}</span></div>
        </div>
      </a>
      <div className="swipeout-actions-left">
        <a href="#" onClick={this.onSwipeOutDelete} className="bg-red">Удалить</a>
      </div>
    </li>;
  }
}

export default DishListItem;