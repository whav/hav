import React from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../../ui/loading";

import { fetchIngestionQueue, loadIngestOptions } from "../../actions/ingest";
import IngestForm from "../../ui/ingest/form";

import PreviewImage from "../filebrowser/preview";

class IngestQueue extends React.Component {
  constructor(props) {
    super(props);
    props.loadIngestData();
    this.state = {
      formData: {}
    };
  }

  onChange = (source, data) => {
    console.log("Something changed..", source, data);
    this.setState(state => {
      return {
        ...this.state,
        formData: {
          ...this.state.formData,
          [source]: {
            ...this.state.formData[source],
            ...data
          }
        }
      };
    });
  };

  render() {
    const { queue, loading, options } = this.props;
    const { formData } = this.state;

    if (loading) {
      return <LoadingIndicator />;
    } else {
      const count = queue.filtered_selection.length;
      let formData = this.state.formData;
      return (
        <div>
          <h1>Ingesting {count === 1 ? "one file" : `${count} files`}</h1>
          <hr />
          {queue.filtered_selection.map((source, index) => (
            <IngestForm
              key={source}
              source={source}
              {...options}
              onChange={this.onChange}
              data={formData[source] || {}}
            >
              <span>Asset #{index + 1}</span>
              <p>
                <PreviewImage source={source} />
              </p>
            </IngestForm>
          ))}
        </div>
      );
    }
  }
}

export default connect(
  (state, ownProps) => {
    const queue_data = state.ingest.ingestionQueues[ownProps.match.params.uuid];
    console.warn(queue_data);
    return {
      queue: queue_data,
      options: state.ingest.options,
      loading: queue_data && queue_data.filtered_selection ? false : true
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
