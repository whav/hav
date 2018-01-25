import React from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../../ui/loading";

import { fetchIngestionQueue } from "../../actions/ingest";

class IngestQueue extends React.Component {
  constructor(props) {
    super(props);
    props.loadIngestData();
  }

  render() {
    const props = this.props;
    if (props.loading) {
      return <LoadingIndicator />;
    } else {
      return <pre>{JSON.stringify(props, null, 2)}</pre>;
    }
  }
}

export default connect(
  (state, ownProps) => {
    const queue_data = state.ingest.ingestionQueues[ownProps.match.params.uuid];
    return {
      queue: queue_data,
      loading: queue_data ? false : state.ingest.loading
    };
  },
  (dispatch, ownProps) => {
    const uuid = ownProps.match.params.uuid;
    return {
      loadIngestData: () => dispatch(fetchIngestionQueue(uuid))
    };
  }
)(IngestQueue);
