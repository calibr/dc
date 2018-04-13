var React = require("react");
var ReactDOM = require("react-dom");
import DishStore from '../stores/Dish.jsx'
import {SpeechToText} from '../util/stt/speechToText.jsx'
import {dishLookup} from '../actions/stt.jsx'

class SpeechRecognitionDishes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: []
    }

    this.onReceiveParts = this.onReceiveParts.bind(this)

    let stt = new SpeechToText()
    stt.on('start', () => {
      console.log('stt start')
    })
    stt.on('end', () => {
      console.log('stt end')
    })
    stt.on('parts', this.onReceiveParts)
    stt.start()
  }
  componentDidMount() {

  }
  componentWillUnmount() {
  }
  _partId(part) {
    return JSON.stringify(part)
  }
  onReceiveParts(parts) {
    let items = this.state.items
    let relookup = false
    // each item in the state corresponds to item from parts array
    for(let i = 0; i != parts.length; i++) {
      let needToFind = false
      let part = parts[i]
      if(i > items.length - 1) {
        // it is new part
        needToFind = true
      }
      else {
        // check if the old part has been changed
        if(part.dishName !== item.dishName) {
          needToFind = true
        }
      }
      if(!needToFind) {
        continue
      }
      relookup = true
    }
    if(relookup) {
      let keywords = parts.map(p => p.dishName)
      dishLookup(keywords)
    }
  }
  render() {
    let readyItems = this.state.items.map(item => {
      if(!item.dishId) {
        return null
      }
      let dish = DishStore.getById(item.dishId)
      return <li>
        <div className="item-content">
          <div className="item-inner">
            <div className="item-title">{dish.title}</div>
            <div className="item-after">
              <span className="badge">{item.weight} г.</span>
            </div>
          </div>
        </div>
      </li>
    })
    let listItems = readyItems.slice()
    listItems.push(<li>
      <div className="item-content">
        <div className="item-inner">
          <div className="item-title"><i className="fa fa-spinner fa-spin"></i></div>
          <div className="item-after">
            <span className="badge"><i className="fa fa-spinner fa-spin"></i></span>
          </div>
        </div>
      </div>
    </li>)
    return <div>
      <div className="dialog">
        <div className="content-block">
          <div>
            Произнесите название блюда и количество грамм, например: "Котлета киевская 39".
            Чтобы добавить еще порцию произнесите "Дальше". Чтобы закончить ввод произнесите "Конец".
          </div>
          <div className="list-block">
            <ul>
              {listItems}
            </ul>
          </div>

          <div className="content-block text-center">
            <a href="#" className="button button-fill color-red">
              Отмена
            </a>
          </div>
        </div>
      </div>
    </div>;
  }
}

export default SpeechRecognitionDishes;