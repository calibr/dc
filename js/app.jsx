var ReactDom = require("react-dom");
var React = require("react");
import navigator from "./navigator.jsx";

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
};
app.getViewByName = (name) => {
  for(let view of app.views) {
    if(view.name === name) {
      return view;
    }
  }
};

// initial navigation
navigator.navigate("/calc");
//navigator.navigate("/dishes");

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

/*
views.forEach(function(v) {
  var view = app.addView(v.container, {
    dynamicNavbar: true,
    domCache: true
  });
  view.components = v.components;
});

function renderCurrentView() {
  var view = app.getCurrentView();
  view.components.forEach(function(comp) {
    ReactDom.render(
      <comp.component view={view}/>,
      document.querySelector(comp.container)
    );
  });
}

renderCurrentView();

$(document).on("tab:show", function() {
  renderCurrentView();
});
*/

/*
var newPageContent = '<div class="page" data-page="my-page">' +
                        '<div class="page-content">' +
                          '<p>Here comes new page</p>' +
                        '</div>' +
                      '</div>';
*/

/*console.log(app.getCurrentView());
app.getCurrentView().router.load({
  content: newPageContent,
  animatePages: false
);*/
