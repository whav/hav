import React from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../../ui/loading";

import { fetchIngestionQueue, loadIngestOptions } from "../../actions/ingest";
import IngestForm from "./form";

class IngestQueue extends React.Component {
  constructor(props) {
    super(props);
    props.loadIngestData();
  }

  render() {
    const { queue, loading, options } = this.props;
    if (loading) {
      return <LoadingIndicator />;
    } else {
      return (
        <div>
          <h1>Ingestion</h1>
          <div>
            {queue.filtered_selection.map(source => (
              <IngestForm key={source} source={source} options={options} />
            ))}
          </div>
        </div>
      );
    }
  }
}

export default connect(
  (state, ownProps) => {
    const queue_data = state.ingest.ingestionQueues[ownProps.match.params.uuid];
    return {
      queue: queue_data,
      options: state.ingest.options,
      loading: queue_data ? false : state.ingest.loading
    };
  },
  (dispatch, ownProps) => {
    const uuid = ownProps.match.params.uuid;
    return {
      loadIngestData: () => {
        dispatch(fetchIngestionQueue(uuid));
        dispatch(loadIngestOptions());
      }
    };
  }
)(IngestQueue);
