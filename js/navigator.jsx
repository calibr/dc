var app = require("./f7app");
import renderer from './renderer.jsx'

var navigator = {
  init: function() {
    window.addEventListener('popstate', (event) => {
      let url = document.location.hash
      if(url.indexOf('#!') !== 0) {
        return
      }
      url = url.replace(/^#!/, '')
      this._loadView(url)
    }, false)
  },
  navigate: function(url, params = {}) {
    let {route} = renderer.getRouteByUrl(url)
    let needToLoadView = true
    if(!params.skipHistory && route && !route.skipHistory) {
      let newHash = '#!' + url
      if(document.location.hash === newHash) {
      }
      else {
        document.location.hash = '#!' + url
        needToLoadView = false
      }
    }
    if(needToLoadView) {
      this._loadView(url)
    }
  },
  _loadView: (url) => {
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

navigator.init()

export default navigator;