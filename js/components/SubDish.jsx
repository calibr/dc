var React = require("react");
var ReactDOM = require("react-dom");

import DishStore from "../stores/Dish.jsx";
import DishPickStore from "../stores/DishPick.jsx";
import {displayDishPicker} from '../actions/addComplexDish.jsx'
import {sortDishes, getCarbsInServing, nameFull as dishNameFull} from "../util/dishes.jsx";
const uuidV4 = require('uuid/v4');

class SubDish extends React.Component {
  constructor(props) {
    super(props);
    this.pickTag = null
    this.state = {
      dishId: props.dishId || 0,
      weight: props.weight || 0
    };
  }
  componentDidMount() {
    DishPickStore.on('pick', this.onDishPicked)
  }
  componentWillUnmount() {
    DishPickStore.removeListener('pick', this.onDishPicked)
  }
  onDishPicked = () => {
    var dishId = DishPickStore.getDishId()
    if(this.pickTag === DishPickStore.tag) {
      var updateState = {
        dishId
      }
      this.setState(updateState)
      this.fireOnChange()
    }
  }
  onWeightFieldChange = (event) => {
    var value = event.target.value;
    value = value.replace(/[^0-9\.]/g, "");
    var updateState = {
      weight: value
    };
    this.setState(updateState);
    this.fireOnChange();
  }
  onStartPickDish = () => {
    this.pickTag = uuidV4()
    displayDishPicker(this.props.uuid)
  }
  fireOnChange = () => {
    setTimeout(() => {
      this.props.onChange && this.props.onChange({
        weight: this.state.weight,
        dishId: this.state.dishId
      });
    }, 0);
  }
  render() {
    let dish = DishStore.getById(this.props.dishId || this.state.dishId)
    return <div className="list-block sub-dish">
      <div className="head">
        <span className="title">{this.props.title}</span>
        <a href="#" className="button button-fill color-red delete" onClick={this.props.onDelete}>Удалить</a>
      </div>
      <ul>
        <li>
          <input type="hidden" className="dishId" value={dish ? dish.id : 0}/>
          <a href="#" className="item-link" onClick={this.onStartPickDish}>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title label">Блюдо</div>
                <div className="item-after">{dish ? dishNameFull(dish) : "Выберите блюдо"}</div>
              </div>
            </div>
          </a>
        </li>
        <li>
          <div className="item-content">
            <div className="item-inner">
              <div className="item-title label">Вес</div>
              <div className="item-input">
                <input name="sub_dish_weight" value={this.state.weight} type="text"
                  className="dishWeight"
                  onChange={this.onWeightFieldChange}
                  placeholder="Введите вес (граммы)"/>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>;
  }
}

export default SubDish;