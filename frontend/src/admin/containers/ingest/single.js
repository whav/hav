import React from "react";
import { connect } from "react-redux";

class SingleIngest extends React.Component {
  render() {
    return <pre>{JSON.stringify(this.props, null, 2)}</pre>;
  }
}

export default connect()(SingleIngest);
