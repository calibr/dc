var React = require("react");
var ReactDOM = require("react-dom");

class SubDish extends React.Component {
  constructor() {
    super();
    this.state = {
      dishId: 0,
      weight: 0
    };
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
  onDishChange = (event) => {
    var dishId = ReactDOM.findDOMNode(this).querySelector(".dishId").value;
    this.setState({
      dishId
    });
    this.fireOnChange();
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
    return <div className="list-block sub-dish">
      <div className="head">
        <span className="title">{this.props.title}</span>
        <a href="#" className="button button-fill color-red delete" onClick={this.props.onDelete}>Удалить</a>
      </div>
      <ul>
        <li>
          <a href="#" className="item-link smart-select"
            data-back-on-select="true" data-searchbar="true"
            data-searchbar-placeholder="Поиск"
            data-back-text="Назад">
            <select
              className="dishId"
              onChange={this.onDishChange}
              defaultValue={this.props.dishId}
              name="sub_dish_id"
            >
              <option disabled></option>
              {this.props.dishesOptions}
            </select>
            <div className="item-content">
              <div className="item-inner">
                <div className="item-title">Блюдо</div>
                <div className="item-after"></div>
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