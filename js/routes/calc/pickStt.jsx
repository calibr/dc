var React = require("react");
var ReactDOM = require("react-dom");
import DishStore from '../../stores/Dish.jsx'
import {dishLookup, hideDialog, startRecognize, changeWeight, cancelRecognition, cancelAllRecognitions, goBack} from '../../actions/stt.jsx'
import STTStore from '../../stores/STT.jsx'
import MealStore from '../../stores/Meal.jsx'
import ServingStore from '../../stores/Serving.jsx'
import {importServings} from '../../actions/servings.jsx'
import {
  getCurrentCoef, getCoefsFromSettings
} from "../../util/coef.jsx";
import {createMeal} from '../../actions/actions.jsx'
import f7app from '../../f7app'
import LoadingBox from '../../components/LoadingBox.jsx'

class SpeechRecognitionDishesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stage: '',
      rawText: '',
      keywordsToDishes: null,
      sttResult: null,
      dishIndex: 0,
      weight: 0,
      tag: null,
      callback: null
    }
    this.onSttStoreChange = this.onSttStoreChange.bind(this)
    this.cancel = this.cancel.bind(this)
    this.add = this.add.bind(this)
    this.again = this.again.bind(this)
  }
  componentDidMount() {
    STTStore.on('change', this.onSttStoreChange)

    this.initRecognize()
  }
  componentWillUnmount() {
    STTStore.removeListener('change', this.onSttStoreChange)
  }
  _partId(part) {
    return JSON.stringify(part)
  }
  onSttStoreChange() {
    this.setState({
      stage: STTStore.stage,
      rawText: STTStore.rawText,
      keywordsToDishes: STTStore.keywordsToDishes,
      sttResult: STTStore.result,
      weight: STTStore.weight,
      callback: STTStore.callback
    })
  }
  onWeightChange(event) {
    let value = event.target.value
    if(value !== '') {
      value = Math.abs(event.target.value)
    }
    changeWeight(value)
  }
  onDishClick(dishIndex) {
    this.setState({dishIndex})
  }
  cancel() {
    cancelRecognition(this.state.tag)
    goBack()
  }
  again() {
    this.initRecognize()
  }
  add() {
    let lookupRes = this.state.keywordsToDishes[this.state.sttResult.dishName]
    let dishId = lookupRes.dishes[this.state.dishIndex]
    let weight = this.state.weight
    let serving = {
      dish_id: dishId,
      weight
    }
    this.state.callback(serving)
    //this.initRecognize()
    goBack()
  }
  initRecognize() {
    let tag = startRecognize()
    setTimeout(() => {
      this.setState({
        tag,
        dishIndex: 0
      })
    }, 0)
  }
  render() {
    let readyItems = []
    if(this.state.stage === 'list') {
      let lookupRes = this.state.keywordsToDishes[this.state.sttResult.dishName]
      let i = -1
      // show only first 10 items
      readyItems = lookupRes.dishes.map(dishId => {
        let dish = DishStore.getById(dishId)
        if(!dish) {
          console.error('Fail to find dish with id', dishId, 'skipping')
          return null
        }
        i++
        return <li key={"dish-choose-" + dishId} className="stt-list-item" onClick={this.onDishClick.bind(this, i)}>
          <label className="label-radio item-content">
            <input type="radio" name="stt-dish-choose" value={dishId} defaultChecked={i === this.state.dishIndex}/>
            <div className="item-inner">
              <div className="item-title">{dish.title}</div>
              <div className="item-after">
                <span className="badge">{dish.carbs} г.у.</span>
              </div>
            </div>
          </label>
        </li>
      })
    }
    let listItems = readyItems.slice()
    let currentSpeech
    let loader
    currentSpeech = <div>
      {
        this.state.stage === 'speaking' ? (this.state.rawText ?
          <div className="content-block text-center current-speech">{this.state.rawText}</div>
          :
          <div className="content-block text-center current-speech-placeholder">Произнесите продукт...</div>
        ) : null
      }

    </div>
    if(this.state.stage === 'lookup') {
      loader = <LoadingBox/>
    }
    let noResultText
    if(this.state.stage === 'noresult') {
      noResultText = <div className="content-block text-center color-red">Не верный формат текста</div>
    }
    let notFoundText
    if(this.state.stage === 'notfound') {
      notFoundText = <div className="content-block text-center color-red">По вашей фразе ничего не найдено</div>
    }
    return <div className="page-content">
      <div className="dialog">
        <div className="content-block">
          <div className="text-center">
            Произнесите название блюда и количество грамм, например: "Котлета киевская 39".
          </div>
          <div className="list-block stt-pick-dish-list">
            <ul>
              {listItems}
            </ul>
          </div>
          {
            this.state.stage === 'list' ?
            <div className="list-block">
              <ul>
                <li>
                  <div className="item-content">
                    <div className="item-inner">
                      <div className="item-title label">Вес</div>
                      <div className="item-input">
                        <input type="number" value={this.state.weight} onChange={this.onWeightChange}/>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div> : null
          }
          {currentSpeech}
          {loader}
          {noResultText}
          {notFoundText}
          <div className="content-block text-center row flex-buttons">
            <button href="#" className="col button button-fill color-red" onClick={this.cancel}>
              Закончить
            </button>
            {
              (
                this.state.stage === 'list' || this.state.stage === 'notfound' || this.state.stage === 'noresult'
              ) ? <button href="#" className="col button button-fill color-blue" onClick={this.again}>
                Еще раз
              </button> : null
            }
            {
              (this.state.stage === 'list') ? <button href="#" className="col button button-fill color-green" onClick={this.add}>
                Добавить
              </button> : null
            }
          </div>
        </div>
      </div>
    </div>;
  }
}

class SpeechRecognitionDishesPageNavBar extends React.Component {
  onBackClick() {
    cancelAllRecognitions()
    goBack()
  }
  render() {
    return <div className="navbar">
      <div className="navbar-inner">
        <div className="left">
          <a href="#" className="link" onClick={this.onBackClick}>
            <i className="icon icon-back"></i>
            <span>Назад</span>
          </a>
        </div>
        <div className="center sliding">Голосовой выбор блюд</div>
        <div className="right">
        </div>
      </div>
    </div>
  }
}

module.exports = {
  page: SpeechRecognitionDishesPage,
  navbar: SpeechRecognitionDishesPageNavBar,
  title: 'Голосовой выбор блюд'
};

