import React from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../../ui/loading";
import Error from "../../ui/components/errors";
import Debug from "../../ui/debug";

import { loadAllIngestionQueues } from "../../ducks/ingest";
import IngestionQueueListing from "../../ui/ingest/queues";

class IngestQueueList extends React.Component {
  constructor(props) {
    super(props);
    props.loadIngestionQueues();
  }

  render() {
    const { loading, queues = [] } = this.props;
    if (loading) {
      return <LoadingIndicator />;
    }
    if (queues.length === 0) {
      return <Error>No queues created.</Error>;
    }

    return (
      <div>
        <IngestionQueueListing queues={queues} />
        {/* <Debug {...this.props} /> */}
      </div>
    );
  }
}

export default connect(
  (state, ownProps) => {
    return {
      queues: Object.values(state.ingest.ingestionQueues),
      loading: state.ingest.loading
    };
  },
  (dispatch, ownProps) => {
    return {
      loadIngestionQueues: () => dispatch(loadAllIngestionQueues())
    };
  }
)(IngestQueueList);
