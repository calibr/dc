var app = require("./f7app");

var navigator = {
  navigate: (url) => {
    console.log('Navigate to', url)
    var parts = url.split("/");
    var viewName = parts[1];
    var view = app.getViewByName(viewName);
    if(!view) {
      throw new Error("View not found " + viewName);
    }
    console.log("Load page into view", viewName);
    let newUrl = "page.html?url=" + url
    let reload = newUrl === view.url
    view.router.load({
      url: newUrl,
      animatePages: false,
      reload
    })
  },
  back: () => {
    app.getCurrentView().router.back({
      animatePages: true
    })
  }
};

export default navigator;