/**
 * Created by sean on 03/02/17.
 */
import React from "react";

class Error extends React.Component {
  render() {
    return (
      <div className="notification is-danger">
        {this.props.children ? this.props.children : <p>Error</p>}
      </div>
    );
  }
}

export default Error;
