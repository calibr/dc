var React = require("react");
var ReactDOM = require("react-dom");
import DishStore from '../stores/Dish.jsx'
import {dishLookup, hideDialog, startRecognize, changeWeight, cancelRecognition} from '../actions/stt.jsx'
import STTStore from '../stores/STT.jsx'
import MealStore from '../stores/Meal.jsx'
import ServingStore from '../stores/Serving.jsx'
import {importServings} from '../actions/servings.jsx'
import {
  getCurrentCoef, getCoefsFromSettings
} from "../util/coef.jsx";
import {createMeal} from '../actions/actions.jsx'
import f7app from '../f7app'
import LoadingBox from './LoadingBox.jsx'

class SpeechRecognitionDishes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stage: '',
      reqId: '',
      rawText: '',
      active: false,
      visible: false,
      keywordsToDishes: null,
      sttResult: null,
      dishIndex: 0,
      weight: 0,
      tag: null
    }

    this.onSttStoreChange = this.onSttStoreChange.bind(this)
    this.onSttVisibilityChange = this.onSttVisibilityChange.bind(this)
    this.cancel = this.cancel.bind(this)
    this.add = this.add.bind(this)
    this.again = this.again.bind(this)
  }
  componentDidMount() {
    STTStore.on('change', this.onSttStoreChange)
    STTStore.on('visibilityChange', this.onSttVisibilityChange)
  }
  componentWillUnmount() {
    STTStore.removeListener('change', this.onSttStoreChange)
    STTStore.removeListener('visibilityChange', this.onSttVisibilityChange)
  }
  _partId(part) {
    return JSON.stringify(part)
  }
  onSttVisibilityChange() {
    this.setState({visible: STTStore.visible})
    if(STTStore.visible) {
      // kind of a wrong way but so far I am not sure how to do this better
      f7app.$('#speech-recognition-dishes-overlay')[0].classList.add('visible')
      this.initRecognize()
    }
    else {
      f7app.$('#speech-recognition-dishes-overlay')[0].classList.remove('visible')
    }
  }
  onSttStoreChange() {
    this.setState({
      stage: STTStore.stage,
      active: STTStore.active,
      rawText: STTStore.rawText,
      keywordsToDishes: STTStore.keywordsToDishes,
      sttResult: STTStore.result,
      weight: STTStore.weight
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
    hideDialog()
  }
  again() {
    this.initRecognize()
  }
  add() {
    let lookupRes = this.state.keywordsToDishes[this.state.sttResult.dishName]
    let dishId = lookupRes.dishes[this.state.dishIndex]
    let weight = this.state.weight
    let servings = []
    servings.push({
      meal_id: MealStore.activeMeal.id,
      dish_id: dishId,
      weight
    })
    importServings(servings)
    this.initRecognize()
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
    if(!this.state.visible) {
      return <div/>
    }
    let readyItems = []
    if(this.state.stage === 'list') {
      let lookupRes = this.state.keywordsToDishes[this.state.sttResult.dishName]
      let i = -1
      // show only first 10 items
      readyItems = lookupRes.dishes.map(dishId => {
        let dish = DishStore.getById(dishId)
        i++
        return <li key={"dish-choose-" + dishId} className="stt-list-item">
          <label className="label-radio item-content">
            <input type="radio" name="stt-dish-choose" value={dishId} onChange={this.onDishClick.bind(this, i)} checked={i === this.state.dishIndex}/>
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
      {this.state.rawText ?
        <div className="content-block text-center current-speech">{this.state.rawText}</div>
        :
        <div className="content-block text-center current-speech-placeholder">Произнесите продукт...</div>
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
    return <div id="speech-recognition-dishes-overlay-innder">
      <div className="dialog">
        <div className="content-block">
          <div>
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
              Отмена
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

export default SpeechRecognitionDishes;