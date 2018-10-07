import React from "react";
import { connect } from "react-redux";

class SingleIngest extends React.Component {
  render() {
    const searchParams = new URLSearchParams(this.props.location.search);
    searchParams.get("source");
    return (
      <pre>
        {JSON.stringify(
          {
            ...this.props,
            source: searchParams.get("source"),
            target: searchParams.get("target")
          },
          null,
          2
        )}
      </pre>
    );
  }
}

export default connect()(SingleIngest);
