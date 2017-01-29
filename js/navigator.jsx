var app = require("./f7app");

var navigator = {
  navigate: (url) => {
    var parts = url.split("/");
    var viewName = parts[1];
    var view = app.getViewByName(viewName);
    if(!view) {
      throw new Error("View not found " + viewName);
    }
    console.log("Load page into view", viewName);
    view.router.load({
      url: "page.html?url=" + url,
      animatePages: false
    });
  }
};

export default navigator;