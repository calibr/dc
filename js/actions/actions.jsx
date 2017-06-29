import 'whatwg-fetch'
import Dispatcher from "../dispatcher.jsx";

const ROOT = "/diab";

function buildQuery(query) {
  var arr = [];
  for(var key in query) {
    arr.push(key + "=" + encodeURIComponent(query[key]))
  }
  return arr.join("&")
}

var loadingDishes = false;
export var loadDishes = function() {
  if(loadingDishes) {
    return;
  }
  loadingDishes = true;
  fetch(ROOT + "/dishes.php?a=fetch").then((response) => {
    return response.json();
  }).then((data) => {
    loadingDishes = false;
    Dispatcher.dispatch({
      eventName: "dishes.list",
      dishes: data
    });
  });
};

export var addDish = function(data, opts = {}) {
  var formData = new FormData();
  for(let k in data) {
    formData.append(k, data[k]);
  }
  fetch(ROOT + "/dishes.php?a=add", {
    method: "POST",
    body: formData
  }).then((response) => {
    return response.json();
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "dishes.added",
      dish: responseData,
      tag: opts.tag
    });
  });
};

export var updateDish = function(id, data) {
  var formData = new FormData();
  for(let k in data) {
    formData.append(k, data[k]);
  }
  fetch(ROOT + "/dishes.php?a=update&id=" + id, {
    method: "POST",
    body: formData
  }).then((response) => {
    return response.json();
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "dishes.updated",
      dish: responseData
    });
  });
};

export var deleteDish = function(id) {
  fetch(ROOT + "/dishes.php?a=delete&id=" + id, {
    method: "POST"
  }).then((response) => {
    Dispatcher.dispatch({
      eventName: "dishes.deleted",
      id: id
    });
  });
};

export var setDishOrder = function(field, direction) {
  setSetting("dish-order", field + ":" + direction);
  Dispatcher.dispatch({
    eventName: "dishes.setOrder",
    order: [field, direction]
  });
};

// meals

export var loadMeals = function(options = {}) {
  var offset = options.offset || 0
  var limit = options.limit || 30
  var query = buildQuery({
    offset,
    limit
  });
  fetch(ROOT + "/meals.php?a=fetch&" + query).then((response) => {
    fetchingActiveMeal = false;
    return response.json();
  }).then((data) => {
    Dispatcher.dispatch({
      eventName: "meals.list",
      meals: data,
      offset,
      limit
    });
  });
}

var fetchingActiveMeal = false;
export var fetchActiveMeal = function() {
  if(fetchingActiveMeal) {
    return;
  }
  fetchingActiveMeal = true;
  fetch(ROOT + "/meals.php?a=fetch_active").then((response) => {
    fetchingActiveMeal = false;
    return response.json();
  }).then((data) => {
    Dispatcher.dispatch({
      eventName: "meals.active-fetch",
      meal: data
    });
  });
};

export var createMeal = function(data) {
  data = data || {};
  var formData = new FormData();
  for(let k in data) {
    formData.append(k, data[k]);
  }
  fetch(ROOT + "/meals.php?a=add", {
    method: "POST",
    body: formData
  }).then((response) => {
    return response.json();
  }).then((data) => {
    Dispatcher.dispatch({
      eventName: "meals.create",
      meal: data
    });
  });
};

export var setMealCoef = function(id, coef) {
  var formData = new FormData();
  formData.append("coef", coef);
  fetch(ROOT + "/meals.php?a=setCoef&id=" + encodeURIComponent(id), {
    method: "POST",
    body: formData
  }).then((response) => {
    return response.json();
  }).then((data) => {
    Dispatcher.dispatch({
      eventName: "meals.update",
      meal: data
    });
  });
};

export var endMeal = function(id) {
  fetch(ROOT + "/meals.php?a=end&id=" + id, {
    method: "POST"
  }).then((response) => {
    return response.json();
  }).then((data) => {
    Dispatcher.dispatch({
      eventName: "meals.end",
      meal: data
    });
  });
};

// servings

export var addServing = function(data) {
  var formData = new FormData();
  for(let k in data) {
    formData.append(k, data[k]);
  }
  fetch(ROOT + "/servings.php?a=add", {
    method: "POST",
    body: formData
  }).then((response) => {
    return response.json();
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "servings.added",
      serving: responseData
    });
  });
};

export var updateServing = function(id, data) {
  var formData = new FormData();
  for(let k in data) {
    formData.append(k, data[k]);
  }
  fetch(ROOT + "/servings.php?a=update&id=" + id, {
    method: "POST",
    body: formData
  }).then((response) => {
    return response.json();
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "servings.updated",
      serving: responseData
    });
  });
};

export var deleteServing = function(id, data) {
  fetch(ROOT + "/servings.php?a=delete&id=" + id, {
    method: "POST"
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "servings.deleted",
      id: id
    });
  });
};

var fetchingServings = {};
export var fetchServings = function(params) {
  var key = "_";
  params = params || {};
  var query = [];
  if(params.meal_id) {
    query.push("meal_id=" + encodeURIComponent(params.meal_id));
    key = "meal_" + params.meal_id;
  }
  query = query.join("&");
  if(fetchingServings[key]) {
    return;
  }
  fetchingServings[key] = true;
  fetch(ROOT + "/servings.php?a=fetch&" + query).then((response) => {
    return response.json();
  }).then((responseData) => {
    fetchingServings[key] = false;
    Dispatcher.dispatch({
      eventName: "servings.list",
      servings: responseData,
      params: params
    });
  });
};

// settings

var fetchingSettings = false;
export var fetchSettings = function() {
  if(fetchingSettings) {
    return;
  }
  fetchingSettings = true;
  fetch(ROOT + "/settings.php?a=fetch").then((response) => {
    return response.json();
  }).then((responseData) => {
    fetchingSettings = false;
    Dispatcher.dispatch({
      eventName: "settings.list",
      settings: responseData,
    });
  });
};

export var saveSettings = function(data) {
  var formData = new FormData();
  for(let k in data) {
    formData.append(k, data[k]);
  }
  fetch(ROOT + "/settings.php?a=save", {
    method: "POST",
    body: formData
  }).then((response) => {
    return response.json();
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "settings.list",
      settings: responseData,
    });
  });
};

export var setSetting = function(k, v) {
  var formData = new FormData();
  formData.append("name", k);
  formData.append("value", v);
  fetch(ROOT + "/settings.php?a=set", {
    method: "POST",
    body: formData
  }).then((response) => {
    return response.json();
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "settings.list",
      settings: responseData,
    });
  });
}