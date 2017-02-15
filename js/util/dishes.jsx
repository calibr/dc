export function sortDishes(dishes, order) {
  order = order.split(":");
  function compare(v1, v2) {
    if(order[0] == "title") {
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