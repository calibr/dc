var app = new Framework7({
  pushState: true,
  swipeBackPage: false
});
app.closeSwipeout = function() {
	if(app.swipeoutOpenedEl) {
		app.swipeoutClose(app.swipeoutOpenedEl)
	}
}
app.$ = Dom7;

module.exports = app