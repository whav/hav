import React from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../../ui/loading";

class IngestQueue extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;
    return <div>I was ingested!!</div>;
  }
}

export default connect()(IngestQueue);
