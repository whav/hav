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
    this.props.fetchInitialData(
      this.props.files.map(f => f.file_path),
      this.props.target.url
    );
  };

  render() {
    if (this.props.ingestion.loading) {
      return <LoadingIndicator />;
    }
    // console.log(this.props.ingestion.entries);
    return (
      <BatchIngest
        ingestionFiles={this.props.ingestion.entries}
        {...this.props.ingestion.options}
        onChange={this.props.updateIngestionData}
        onSave={this.saveData}
      />
    );
  }
}

export default connect(
  (state, ownProps) => {
    const { target, files } = ownProps.location.state;
    const ingestionData = state.ingest;
    return {
      target,
      files,
      ingestion: ingestionData
    };
  },
  {
    fetchInitialData,
    saveIngestionData,
    updateIngestionData
  }
)(Ingest);
