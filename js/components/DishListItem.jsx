var React = require("react");

class DishListItem extends React.Component {
  render() {
    var dish = this.props.dish;
    return <li>
      <a onClick={this.props.onClick} className="item-content item-link">
        <div className="item-inner">
          <div className="item-title">{dish.title}</div>
          <div className="item-after"><span className="badge">{dish.carbs}</span></div>
        </div>
      </a>
    </li>;
  }
}

export default DishListItem;