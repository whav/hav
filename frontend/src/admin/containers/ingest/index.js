import React from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../../ui/loading";

import BatchIngest from "../../ui/ingest/step2.js";

import {
  fetchInitialData,
  saveIngestionData,
  updateIngestionData
} from "../../actions/ingest";

import pickBy from "lodash/pickBy";

class Ingest extends React.Component {
  constructor(props) {
    super(props);
    this.loadFormData();
  }

  saveData = () => {
    console.warn("Attempting to save data...");
  };

  loadFormData = () => {
    this.props.fetchInitialData(this.props.initialItems, this.props.target);
  };

  render() {
    if (this.props.loading) {
      return <LoadingIndicator />;
    }
    return <pre>{JSON.stringify(this.props, null, 2)}</pre>;
    // (
    //   <BatchIngest
    //     ingestionFiles={this.props.ingestion.entries}
    //     {...this.props.ingestion.options}
    //     onChange={this.props.updateIngestionData}
    //     onSave={this.saveData}
    //   />
    // );
  }
}

export default connect(
  state => {
    const { ingestTo, queue, loading } = state.ingest;
    return {
      target: ingestTo,
      intitalItems: queue,
      loading
    };
  },
  {
    fetchInitialData,
    saveIngestionData,
    updateIngestionData
  }
)(Ingest);
