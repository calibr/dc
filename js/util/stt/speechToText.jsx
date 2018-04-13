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
  }
  start(language = 'ru') {
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
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language
    recognition.onstart = this.onRecognitionStart
    recognition.onresult = this.onRecognitionResult
    recognition.onerror = this.onRecognitionError
    recognition.onend = this.onRecognitionEnd
    recognition.start()
    this.recognition = recognition
  }
  onRecognitionStart() {
    this.emit('start')
  }
  onRecognitionResult(event) {
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
    console.log('raw', text)
    // split on parts
    let parts = text.split(this.nextRegExp)
    parts = parts.map(part => part.trim())
    parts = parts.filter(part => part.length > 0)
    if(this.stopRegExp.test(text)) {
      this.recognition.stop()
    }
    // pasing
    let data = []
    for(let part of parts) {
      let numberM = part.match(/([0-9\.]+)/)
      if(numberM) {
        let d = {}
        let grams = numberM[1]
        let dishName = part.split(grams)[0]
        d.dishName = dishName.trim()
        d.weight = grams
        data.push(d)
      }
    }
    this.emit('parts', data)
  }
  onRecognitionError() {
  }
  onRecognitionEnd() {
    this.emit('end')
  }
}

