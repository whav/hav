import React from "react";

class Debug extends React.Component {
  render() {
    return <pre>{JSON.stringify(this.props, null, 2)}</pre>;
  }
}

export default Debug;
