export default class SimpleIndex {
  constructor() {
    this.index = {}
  }
  setWords(id, words) {
    for(let word of words) {
      if(!index[word]) {
        index[word] = {}
      }
      if(index[word][id]) {
        continue
      }
      index[word][id] = true
    }
  }
  search(words) {
    let res = {}
    for(let word of words) {
      let ids = index[word] ? index[word] : []
      for(let id of ids) {
        if(!res[id]) {
          res[id] = {
            score: 0,
            words: []
          }
        }
        res[id]++
        res[id].words.push(word)
      }
    }
    let resArr = []
    for(let id in res) {
      resArr.push({
        id,
        data: res[id]
      })
    }
    resArr.sort((a, b) => {
      return b.data.score - a.data.score
    })
    return resArr
  }
}