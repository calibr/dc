import UserStore from './stores/User.jsx'
import navigator from './navigator.jsx'

class AccessControl {
  constructor() {
    this.navigateMiddleware = this.navigateMiddleware.bind(this)
    navigator.addNavigateMiddleware(this.navigateMiddleware)
  }
  navigateMiddleware({url}) {
    if(!this.isActionAllowed(url)) {
      return {url: '/auth'}
    }
  }
  isActionAllowed(url) {
    let view = url.split('/')[1]
    if(UserStore.auth) {
      return true;
    }
    if(view === 'auth') {
      return true
    }
    return false
  }
}

export default new AccessControl