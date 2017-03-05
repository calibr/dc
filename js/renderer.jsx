var $ = require("./f7app").$;
var ReactDom = require("react-dom");
var React = require("react");
var f7app = require("./f7app");
var UrlPattern = require("url-pattern");

var routes = {
  "/calc": require("./routes/calc/main.jsx"),
  "/dishes": require("./routes/dishes/main.jsx"),
  "/dishes/addComplex": require("./routes/dishes/addComplex.jsx"),
  "/dishes/add": require("./routes/dishes/add.jsx"),
  "/dishes/:id": require("./routes/dishes/add.jsx"),
  "/calc/servings/add": require("./routes/servings/add.jsx"),
  "/calc/servings/:id": require("./routes/servings/add.jsx"),
  "/settings": require("./routes/settings/main.jsx")
};

$(document).on('pageBeforeInit', function (e) {
  // Page Data contains all required information about loaded and initialized page
  var page = e.detail.page;
  if(page.url.indexOf("page.html?url=") < 0) {
    return;
  }
  var url = page.url.replace(/^.+?\?url=/, "");
  // search for route
  let route;
  let routeParams;
  for(let path in routes) {
    let pattern = new UrlPattern(path);
    routeParams = pattern.match(url);
    if(routeParams) {
      route = routes[path];
      break;
    }
  }
  if(!route) {
    throw new Error("Couldn't find route for " + url);
  }
  let PageComponent = route.page;
  let NavbarComponent = route.navbar;
  ReactDom.render(<PageComponent {...routeParams}/>, page.container);
  ReactDom.render(<NavbarComponent {...routeParams}/>, page.navbarInnerContainer);
  if(route.custom) {
    for(let c of routes[url].custom) {
      ReactDom.render(<c.component/>, document.querySelector(c.container));
    }
  }
});

var renderer = {};

export default renderer;