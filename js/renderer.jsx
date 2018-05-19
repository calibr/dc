var $ = require("./f7app").$;
var ReactDom = require("react-dom");
var React = require("react");
var f7app = require("./f7app");
var UrlPattern = require("url-pattern");

var routes = {
  "/calc": require("./routes/calc/main.jsx"),
  "/calc/pick": require("./routes/calc/pick.jsx"),
  "/calc/pickStt": require("./routes/calc/pickStt.jsx"),
  "/dishes": require("./routes/dishes/main.jsx"),
  "/dishes/addComplex": require("./routes/dishes/addComplex.jsx"),
  "/dishes/pick": require("./routes/dishes/pick.jsx"),
  "/dishes/pickStt": require("./routes/dishes/pickStt.jsx"),
  "/dishes/add": require("./routes/dishes/add.jsx"),
  "/dishes/:id": require("./routes/dishes/add.jsx"),
  "/calc/servings/add": require("./routes/servings/add.jsx"),
  "/calc/servings/:id": require("./routes/servings/add.jsx"),
  "/settings": require("./routes/settings/main.jsx"),
  "/settings/coeffs": require("./routes/settings/coeffs.jsx"),
  "/settings/nightscout": require("./routes/settings/nightscout.jsx"),
  "/history": require("./routes/history/main.jsx"),
};

var prevPage = null

$(document).on('pageBeforeInit', function (e) {
  console.log('before init event', e.detail)
  // Page Data contains all required information about loaded and initialized page
  var page = e.detail.page;
  if(page.url.indexOf("page.html?url=") < 0) {
    return;
  }
  var url = f7app.getActualPageUrl(page.url)
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

  if(prevPage) {
    console.log('Cleanup old page components', prevPage.url)
    for(let {node} of prevPage.components) {
      ReactDom.unmountComponentAtNode(node)
    }
  }

  let pageInfo = {
    url,
    page,
    components: []
  }

  let PageComponent = route.page;
  let NavbarComponent = route.navbar;

  let component = ReactDom.render(<PageComponent {...routeParams}/>, page.container);
  pageInfo.components.push({
    node: page.container,
    component
  })
  component = ReactDom.render(<NavbarComponent {...routeParams}/>, page.navbarInnerContainer);
  pageInfo.components.push({
    node: page.navbarInnerContainer,
    component
  })
  if(route.custom) {
    for(let c of routes[url].custom) {
      let node = document.querySelector(c.container)
      component = ReactDom.render(<c.component/>, node);
      pageInfo.components.push({
        node,
        component
      })
    }
  }
  prevPage = pageInfo
});

var renderer = {};

export default renderer