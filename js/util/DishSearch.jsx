import escapeRegexp from 'escape-string-regexp'

class DishSearch {
  constructor(query, dishes) {
    this.query = query
    this.dishes = dishes
  }
  search() {
    let query = this.query
    query = escapeRegexp(query)
    query = query.replace(/\s+/, "\\s+")
    let regexp = new RegExp('(?:^|[\\s-])' + query, 'i')
    let searchCarbs = null
    if(/^[0-9]+$/.test(query)) {
      searchCarbs = parseInt(query)
    }
    let dishesDisplayList = this.dishes
    if(query) {
      // filter dishes by query
      dishesDisplayList = []
      for(let dish of this.dishes) {
        let match = false
        if(regexp.test(dish.title)) {
          match = true
        }
        else if(searchCarbs && dish.carbsInt === searchCarbs) {
          match = true
        }
        if(match) {
          dishesDisplayList.push(dish)
        }
      }
    }
    return dishesDisplayList
  }
}

export default DishSearch