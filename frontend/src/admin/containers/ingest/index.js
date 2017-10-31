import React from "react";
import { connect } from "react-redux";
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
    return (
      <BatchIngest
        ingestionFiles={this.props.entries}
        {...this.props.options}
        onChange={this.props.updateIngestionData}
        onSave={this.saveData}
      />
    );
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
  {
    fetchInitialData,
    saveIngestionData,
    updateIngestionData
  }
)(Ingest);
