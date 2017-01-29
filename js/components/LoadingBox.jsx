var React = require("react");

class LoadingBox extends React.Component {
  render() {
    return <div className="content-block text-center"><span className="preloader"></span></div>;
  }
}

export default LoadingBox;