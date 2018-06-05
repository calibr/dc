var React = require("react");
var ReactDOM = require("react-dom");

class InfiniteScroll extends React.Component {
  constructor() {
    super()
    this.state = {}
  }
  componentDidMount() {
    let rootNode = ReactDOM.findDOMNode(this)
    // find scrollable
    let node = rootNode
    while(node) {
      try {
        let computed = getComputedStyle(node)
        if(computed.overflowY === 'auto' || computed.overflowY === 'scroll') {
          break
        }
        node = node.parentNode
      }
      catch(ex) {
        break
      }
    }
    this.scrollable = node
    this.onNodeScroll = this.onNodeScroll.bind(this)
    this.scrollable.addEventListener('scroll', this.onNodeScroll, false)
  }
  componentWillUnmount() {
    this.scrollable.removeEventListener('scroll', this.onNodeScroll, false)
  }
  onNodeScroll() {
    if(this.props.loading || this.props.fullfilled) {
      return
    }
    let scrolledAmount = this.scrollable.scrollTop/(this.scrollable.scrollHeight - this.scrollable.offsetHeight)
    if(scrolledAmount >= this.props.preloadThreshold) {
      this.props.onNeedPreload()
    }
  }
  render() {
    return <div>{this.props.children}</div>
  }
}

export default InfiniteScroll;