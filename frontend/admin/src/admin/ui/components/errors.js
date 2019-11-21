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

const List = ({ items = [] }) => (
  <ul>{items.map((m, i) => <li key={i}>{m}</li>)}</ul>
);

const ErrorList = ({ errors = [] }) => (
  <Error>
    <List items={errors} />
  </Error>
);

const KeyedErrorList = ({ title, errors }) => {
  return (
    <Error>
      {title ? <h3 className="subtitle is-3">{title}</h3> : null}
      {Object.keys(errors).map(k => {
        const msgs = errors[k];
        return (
          <div key={k}>
            <em>{k}</em>
            <List errors={msgs} />
          </div>
        );
      })}
    </Error>
  );
};

export default Error;
export { KeyedErrorList, ErrorList };
