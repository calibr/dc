import 'whatwg-fetch'
import Dispatcher from "../dispatcher.jsx";
import {apiFetch} from '../util/fetch.jsx'
import UUID from 'uuid'

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
  apiFetch("/api/dish/fetch").then((data) => {
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
  Dispatcher.dispatch({
    eventName: "dishes.request_add",
    data
  });
  apiFetch("/api/dish/add", {
    method: "POST",
    body: formData
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
  apiFetch("/api/dish/update?id=" + id, {
    method: "POST",
    body: formData
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "dishes.updated",
      dish: responseData
    });
  });
};

export var deleteDish = function(id) {
  apiFetch("/api/dish/delete?id=" + id, {
    method: "POST"
  }).then((response) => {
    Dispatcher.dispatch({
      eventName: "dishes.deleted",
      id: id
    });
  });
};

export var setDishOrder = function(field, direction) {
  setSetting("dish_order", field + ":" + direction);
  Dispatcher.dispatch({
    eventName: "dishes.setOrder",
    order: [field, direction]
  });
};

// meals
export var loadMeals = function(options = {}) {
  var offset = options.offset || 0
  var limit = options.limit || 30
  var timeZoneOffset = options.timeZoneOffset || 0
  var doNotCut = options.doNotCut || false
  var query = buildQuery({
    offset,
    limit,
    timeZoneOffset,
    doNotCut
  });
  let tag = UUID.v4()
  apiFetch("/api/meal/fetch?" + query).then((data) => {
    fetchingActiveMeal = false;
    Dispatcher.dispatch({
      eventName: "meals.list",
      meals: data,
      offset,
      limit,
      tag
    });
  })
  return tag
}

var fetchingActiveMeal = false;
export var fetchActiveMeal = function() {
  if(fetchingActiveMeal) {
    return;
  }
  fetchingActiveMeal = true;
  apiFetch("/api/meal/fetchactive").then((data) => {
    fetchingActiveMeal = false;
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
  apiFetch("/api/meal/add", {
    method: "POST",
    body: formData
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
  apiFetch("/api/meal/setCoef?id=" + encodeURIComponent(id), {
    method: "POST",
    body: formData
  }).then((data) => {
    Dispatcher.dispatch({
      eventName: "meals.update",
      meal: data
    });
  });
};

export var endMeal = function(id) {
  apiFetch("/api/meal/end?id=" + id, {
    method: "POST"
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
  Dispatcher.dispatch({
    eventName: "servings.request_add",
    data
  });
  apiFetch("/api/serving/add", {
    method: "POST",
    body: formData
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
  apiFetch("/api/serving/update?id=" + id, {
    method: "POST",
    body: formData
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "servings.updated",
      serving: responseData
    });
  });
};

export var deleteServing = function(id, data) {
  apiFetch("/api/serving/delete?id=" + id, {
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
  apiFetch("/api/serving/fetch?" + query).then((responseData) => {
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
  apiFetch("/api/settings/fetch").then((responseData) => {
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
  apiFetch("/api/settings/save", {
    method: "POST",
    body: formData
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
  apiFetch("/api/settings/set", {
    method: "POST",
    body: formData
  }).then((responseData) => {
    Dispatcher.dispatch({
      eventName: "settings.list",
      settings: responseData,
    });
  });
}