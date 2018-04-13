var ReactDom = require("react-dom");
var React = require("react");
import navigator from "./navigator.jsx";
import SpeechRecognitionDishes from './components/SpeechRecognitionDishes.jsx'

require("./renderer.jsx");

var app = require("./f7app");
var $ = require("./f7app").$;

var calcView = app.addView("#calc-view", {
  dynamicNavbar: true
});
calcView.name = "calc";
var dishesView = app.addView("#dishes-view", {
  dynamicNavbar: true
});
dishesView.name = "dishes";
var settingsView = app.addView("#settings-view", {
  dynamicNavbar: true
});
settingsView.name = "settings";
var historyView = app.addView("#history-view", {
  dynamicNavbar: true
});
historyView.name = "history";

// extending framework7 app
app.getActiveView = () => {
  var activeA = document.querySelector(".toolbar .tab-link.active");
  if(activeA.getAttribute("href") === "#calc-view") {
    return calcView;
  }
  if(activeA.getAttribute("href") === "#dishes-view") {
    return dishesView;
  }
  if(activeA.getAttribute("href") === "#settings-view") {
    return settingsView;
  }
  if(activeA.getAttribute("href") === "#history-view") {
    return historyView;
  }
};
app.getViewByName = (name) => {
  for(let view of app.views) {
    if(view.name === name) {
      return view;
    }
  }
};
app.getActualPageUrl = (url) => {
  return url.replace(/^.+?\?url=/, "")
}

// initial navigation
navigator.navigate("/calc");

$(document).on("tab:show", (event) => {
  var viewName = event.target.getAttribute("id").replace("-view", "");
  navigator.navigate("/" + viewName);
});

$(document).on('page:beforeremove', (event) => {
  if(event.detail) {
    var name = event.detail.page.name;
    if(name && name.indexOf("smart-select-") === 0) {
      setTimeout(function() {
        // make sure that transition is ended, because sometimes navbar just disappears after returning from
        // smart select
        $(".navbar-inner").removeClass("navbar-from-center-to-left");
      }, 0);
    }
  }
});


ReactDom.render(<SpeechRecognitionDishes/>, $('#speech-recognition-dishes-overlay')[0]);