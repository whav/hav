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

const KeyedErrorList = ({ errors }) => {
  console.log(errors);
  return (
    <Error>
      {Object.keys(errors).map(k => {
        const msgs = errors[k];
        return (
          <div key={k}>
            <em>{k}</em>
            <ul>{msgs.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </div>
        );
      })}
    </Error>
  );
};

export default Error;
export { KeyedErrorList };
