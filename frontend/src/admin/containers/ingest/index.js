import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import LoadingIndicator from "../../ui/loading";

import BatchIngest from "../../ui/ingest";

import {
  fetchInitialData,
  saveIngestionData,
  updateIngestionData
} from "../../actions/ingest";

import pickBy from "lodash/pickBy";

class Ingest extends React.Component {
  constructor(props) {
    super(props);
  }

  saveData = () => {
    this.props.saveIngestionData(this.props.target, this.props.initialItems);
  };

  loadFormData = () => {
    this.props.fetchInitialData(this.props.initialItems, this.props.target);
  };

  render() {
    console.warn(this.props);
    const props = this.props;
    // if (this.props.loading) {
    return (
      <div>
        <pre>
          {JSON.stringify(
            {
              target: props.target,
              entries: this.props.initialItems
            },
            null,
            2
          )}
        </pre>
        <button onClick={() => this.saveData()}>Save</button>
      </div>
    );
    // }
    // return (
    //   <BatchIngest
    //     ingestionFiles={this.props.entries}
    //     {...this.props.options}
    //     onChange={this.props.updateIngestionData}
    //     save={this.saveData}
    //   />
    // );
  }
}

export default connect(
  state => {
    const { ingestTo, queue, loading, options, entries } = state.ingest;
    return {
      target: ingestTo,
      initialItems: queue,
      loading,
      options,
      entries
    };
  },
  dispatch => {
    return bindActionCreators({ saveIngestionData }, dispatch);
  }
)(Ingest);
