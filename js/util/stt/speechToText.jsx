import EventEmitter from 'events'
import ruConfig from './ru.jsx'
import escapeRegExp from 'escape-string-regexp'

let configs = {
  ru: ruConfig
}

export class SpeechToText extends EventEmitter {
  constructor() {
    super()
    this.onRecognitionStart = this.onRecognitionStart.bind(this)
    this.onRecognitionResult = this.onRecognitionResult.bind(this)
    this.onRecognitionError = this.onRecognitionError.bind(this)
    this.onRecognitionEnd = this.onRecognitionEnd.bind(this)
    this.results = []
    this.rawResult = null
    this.language = null
  }
  start(language = 'ru') {
    this.language = language
    this.nextItemIndex = 0
    this.langConfig = configs[language]
    let nochar = '[,\\.-_\\s]'
    // precompile some regexps
    this.nextRegExp = new RegExp('(?:' + nochar + '|^)(?:' + this.langConfig.next.map(escapeRegExp).join('|') + ')(?:' + nochar + '|$)')
    this.stopRegExp = new RegExp('(?:' + nochar + '|^)(?:' + this.langConfig.stop.map(escapeRegExp).join('|') + ')(?:' + nochar + '|$)')
    this._start()
  }
  _start() {
    var recognition = new webkitSpeechRecognition()
    //recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = this.language
    recognition.onstart = this.onRecognitionStart
    recognition.onresult = this.onRecognitionResult
    recognition.onerror = this.onRecognitionError
    recognition.onend = this.onRecognitionEnd
    recognition.start()
    this.recognition = recognition

    /*
    // test
    setTimeout(() => {
      let d = {}
      this.rawResult = 'каша 22г'
      d.dishName = 'каша'
      d.weight = 22
      this.results.push(d)
      // pasing
      this.emit('result', d)
      this.recognition.stop()
    }, 0)*/
  }
  onRecognitionStart() {
    this.emit('start')
  }
  onRecognitionResult(event) {
    if(event.currentTarget._finalized) {
      return
    }
    let results = event.results
    if(!results.length) {
      return
    }
    let phrases = []
    for(let i = 0; i != results.length; i++) {
      let result = results[i]
      result = result[0]
      phrases.push(result.transcript)
    }
    let text = phrases.join(' ')
    text = text.toLowerCase()

    this.emit('raw', text)
    this.rawResult = text
  }
  onRecognitionError() {
  }
  onRecognitionEnd(event) {
    let text = this.rawResult
    let numberM = text && text.match(/([0-9\.]+)/)
    if(numberM) {
      let d = {}
      let grams = numberM[1]
      let dishName = text.split(grams)[0]
      d.dishName = dishName.trim()
      d.weight = grams
      this.results.push(d)
      // pasing
      this.emit('result', d)
    }
    else {
      this.emit('noresult')
    }
    this.emit('end')
  }
  cancel() {
    this.recognition.stop()
  }
}

