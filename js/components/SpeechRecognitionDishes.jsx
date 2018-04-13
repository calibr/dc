var React = require("react");
var ReactDOM = require("react-dom");
import DishStore from '../stores/Dish.jsx'
import {SpeechToText} from '../util/stt/speechToText.jsx'
import {dishLookup, hideDialog} from '../actions/stt.jsx'
import STTStore from '../stores/STT.jsx'
import MealStore from '../stores/Meal.jsx'
import ServingStore from '../stores/Serving.jsx'
import {importServings} from '../actions/servings.jsx'
import {
  getCurrentCoef, getCoefsFromSettings
} from "../util/coef.jsx";
import {createMeal} from '../actions/actions.jsx'
import f7app from '../f7app'

class SpeechRecognitionDishes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: {},
      weights: {},
      reqIds: [],
      loadingReqs: [],
      rawText: '',
      active: true,
      importTag: null,
      visible: false
    }

    this.onResult = this.onResult.bind(this)
    this.onSttStoreChange = this.onSttStoreChange.bind(this)
    this.onSttVisibilityChange = this.onSttVisibilityChange.bind(this)
    this.onSttRawText = this.onSttRawText.bind(this)
    this.onSttEnd = this.onSttEnd.bind(this)
    this.onMealChange = this.onMealChange.bind(this)
    this.onServingChange = this.onServingChange.bind(this)
  }
  componentDidMount() {
    STTStore.on('change', this.onSttStoreChange)
    STTStore.on('visibilityChange', this.onSttVisibilityChange)
    MealStore.on('change', this.onMealChange)
    ServingStore.on('change', this.onServingChange)
  }
  componentWillUnmount() {
    STTStore.removeListener('change', this.onSttStoreChange)
    STTStore.removeListener('visibilityChange', this.onSttVisibilityChange)
    MealStore.removeListener('change', this.onMealChange)
    ServingStore.removeListener('change', this.onServingChange)
  }
  _partId(part) {
    return JSON.stringify(part)
  }
  onSttVisibilityChange() {
    this.setState({visible: STTStore.visible})
    if(STTStore.visible) {
      // kind of a wrong way but so far I am not sure how to do this better
      f7app.$('#speech-recognition-dishes-overlay')[0].classList.add('visible')
      let stt = new SpeechToText()
      stt.on('start', () => {
        console.log('stt start')
      })
      stt.on('end', this.onSttEnd)
      stt.on('result', this.onResult)
      stt.on('raw', this.onSttRawText)
      stt.start()
    }
    else {
      f7app.$('#speech-recognition-dishes-overlay')[0].classList.remove('visible')
    }
  }
  onSttRawText(rawText) {
    this.setState({rawText})
  }
  onServingChange(info) {
    if(!info) {
      return
    }
    if(info.tag === this.state.importTag) {
      setTimeout(function() {
        hideDialog()
      }, 0)
    }
  }
  onSttEnd() {
    this.setState({active: false})
    this.checkCanClose()
  }
  onSttStoreChange() {
    let items = this.state.items
    for(let reqId of this.state.reqIds) {
      if(items[reqId]) {
        continue
      }
      let res = STTStore.results.get(reqId)
      if(!res) {
        continue
      }
      let dishesIds = res[Object.keys(res)[0]].dishes
      let dishId = dishesIds[0]
      items[reqId] = {dishId}

      let loadingReqs = this.state.loadingReqs
      let index = loadingReqs.indexOf(reqId)
      if(index >= 0) {
        loadingReqs.splice(index, 1)
      }
      this.setState({items, loadingReqs})
      this.checkCanClose()
    }
  }
  onMealChange() {
    this.checkCanClose()
  }
  onResult(result) {
    let reqIds = this.state.reqIds
    let weights = this.state.weights
    let loadingReqs = this.state.loadingReqs
    let reqId = dishLookup([result.dishName])
    reqIds.push(reqId)
    loadingReqs.push(reqId)
    weights[reqId] = result.weight
    this.setState({weights, reqIds, loadingReqs})
    /*
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
    }*/
  }
  checkCanClose() {
    if(this.state.active) {
      return
    }
    if(this.state.loadingReqs.length) {
      return
    }
    if(!MealStore.getActive()) {
      console.log('Creating meal...')
      // need to start meal
      let coefs = getCoefsFromSettings(this.state.settings)
      let k = getCurrentCoef(coefs)
      createMeal({
        coef: k
      })
      return
    }
    let mealId = MealStore.getActive().id
    let servings = []
    for(let reqId of this.state.reqIds) {
      let item = this.state.items[reqId]
      let weight = this.state.weights[reqId]
      if(!item || !weight) {
        continue
      }
      servings.push({
        meal_id: mealId,
        dish_id: item.dishId,
        weight: weight
      })
    }
    this.setState({
      importTag: importServings(servings)
    })
  }
  render() {
    if(!this.state.visible) {
      return <div/>
    }
    let readyItems = this.state.reqIds.map(reqId => {
      let item = this.state.items[reqId]
      if(!item) {
        return
      }
      let weight = this.state.weights[reqId]
      if(!item.dishId) {
        return null
      }
      let dish = DishStore.getById(item.dishId)
      return <li key={reqId} className="stt-list-item">
        <div className="item-content">
          <div className="item-inner">
            <div className="item-title">{dish.title}</div>
            <div className="item-after">
              <span className="badge">{dish.carbs} г.у.</span>
              <span className="badge">{weight} г.</span>
            </div>
          </div>
        </div>
      </li>
    })
    let listItems = readyItems.slice()
    let currentSpeech
    if(this.state.active) {
      listItems.push(<li key="loading">
        <div className="item-content">
          <div className="item-inner">
            <div className="item-title"><i className="fa fa-spinner fa-spin"></i></div>
            <div className="item-after">
              <span className="badge"><i className="fa fa-spinner fa-spin"></i></span>
            </div>
          </div>
        </div>
      </li>)
      currentSpeech = <div>
        {this.state.rawText ?
          <div className="content-block text-center current-speech">{this.state.rawText}</div>
          :
          <div className="content-block text-center current-speech-placeholder">Произнесите продукт...</div>
        }
      </div>
    }
    return <div id="speech-recognition-dishes-overlay-innder">
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
          {currentSpeech}
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