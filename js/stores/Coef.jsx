var EventEmitter = require("events");
import Dispatcher from "../dispatcher.jsx";

class CoefStore extends EventEmitter {
  coeffs = null
  constructor() {
    super();
    this.idMap = new Map()
    Dispatcher.register(this.dispatch.bind(this));
  }
  getCoeffs() {
    return this.coeffs;
  }
  getDishesActive() {
    return this.dishesActive;
  }
  getOrder() {
    return this.order;
  }
  getById(id) {
    if(!this.dishes) {
      return null;
    }
    if(typeof id !== 'string') {
      id = id.toString()
    }
    return this.idMap.get(id)
  }
  dispatch(payload) {
    if(payload.eventName === "coeffs.list") {
      this.coeffs = payload.coeffs
      this.emit("change");
    } else if(payload.eventName === "coeffs.added") {
      this.coeffs.push(payload.coef)
      this.emit("added", payload.coef)
    } else if(payload.eventName === "coeffs.updated") {
      const coeffs = this.coeffs.slice()
      const idx = coeffs.findIndex(coef => coef.id == payload.coef.id)
      if (idx >= 0) {
        coeffs.splice(idx, 1, payload.coef)
      }
      this.coeffs = coeffs
      this.emit("updated", payload.coef)
    }
  }
}

export default new CoefStore