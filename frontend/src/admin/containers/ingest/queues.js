import React from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../../ui/loading";
import Error from "../../ui/components/errors";

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

    return <IngestionQueueListing queues={queues} />;
  }
}

export default connect(
  state => {
    const queues = Object.values(state.ingest.ingestionQueues).filter(q => {
      if (q.item_count === 1) {
        return false;
      }
      return true;
    });
    return {
      queues,
      loading: state.ingest.loading
    };
  },
  dispatch => {
    return {
      loadIngestionQueues: () => dispatch(loadAllIngestionQueues())
    };
  }
)(IngestQueueList);
