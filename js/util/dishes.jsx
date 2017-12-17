import {visibleRel} from './date.jsx'
import escapeRegexp from 'escape-string-regexp'

export function sortDishes(dishes, order) {
  order = order.split(":");
  function compare(v1, v2) {
    if(order[0] == "title" || order[0] == "date") {
      v1 = v1.toLowerCase().trim();
      v2 = v2.toLowerCase().trim();
      if(v1 > v2) {
        return 1;
      }
      else if(v1 < v2) {
        return -1;
      }
      return 0;
    }
    else {
      return v1 - v2;
    }
  }
  dishes.sort((d1, d2) => {
    var cmp = compare(d1[order[0]], d2[order[0]]);
    if(cmp === 0) {
      cmp = compare(d1.id, d2.id);
    }
    if(order[1] === "desc") {
      cmp = -cmp;
    }
    return cmp;
  });
  return dishes;
}

export function getCarbsInServing(dish, weight) {
  var carbsin1gram = dish.carbs/100;
  return Math.round(carbsin1gram * weight * 100)/100;
}

export function getFatsInServing(dish, weight) {
  var in1gram = dish.fats/100;
  return Math.round(in1gram * weight * 100)/100;
}

export function getProteinsInServing(dish, weight) {
  var in1gram = dish.proteins/100;
  return Math.round(in1gram * weight * 100)/100;
}

export function nameFull(dish) {
  var title = dish.title + "(" + dish.carbs + ")"
  if(dish.is_complex) {
    title += ' 🍕 ' + visibleRel(dish.date)
  }
  return title
}

export function searchQueryToRegExp(query) {
  query = escapeRegexp(query)
  query = query.replace(/\s+/, "\\s+")
  let regexp = new RegExp('(?:^|[\\s-])' + query, 'i')
  return regexp
}

export function filterDishesByQuery(query, dishes) {
  let regexp = searchQueryToRegExp(query)
  let result = []
  for(let dish of dishes) {
    if(regexp.test(dish.title)) {
      result.push(dish)
    }
  }
  return result
}