var ReactDom = require("react-dom");
var React = require("react");
import navigator from "./navigator.jsx";
import SpeechRecognitionDishes from './components/SpeechRecognitionDishes.jsx'
import UserStore from './stores/User.jsx'
import accessControl from './accesscontrol.jsx'
import renderer from "./renderer.jsx"

// what a weird word:)
let prepopulatableStores = {
  user: UserStore
}

var app = require("./f7app");
var $ = require("./f7app").$;

renderer.once('rendered', () => {
  $('body').removeClass('loading')
})

let viewsNames = [
  'calc',
  'dishes',
  'settings',
  'history',
  'auth'
]
let viewsByName = {}
for(let viewName of viewsNames) {
  let view = app.addView("#" + viewName + "-view", {
    dynamicNavbar: true
  });
  view.name = viewName
  viewsByName[viewName] = view
}

// extending framework7 app
app.getActiveView = () => {
  var activeA = document.querySelector(".toolbar .tab-link.active");
  let viewName = activeA.getAttribute("href").replace('#', '').replace('-view', '')
  return viewsByName[viewName]
};
app.ensureViewOpened = (name) => {
  let $link = $('#bottom-tabbar a[href="#' + name + '-view"]')
  if(!$link.hasClass('active')) {
    $link.click()
  }
}
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

if(window.PREPOPULATE) {
  for(let item of window.PREPOPULATE) {
    prepopulatableStores[item.store].populate(item.data)
  }
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

