import React from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../../ui/loading";

import BatchIngest from "../../ui/ingest/step2.js";

import { fetchInitialData, saveIngestionData } from "../../actions/ingest";

import pickBy from "lodash/pickBy";

class Ingest extends React.Component {
  constructor(props) {
    super(props);
    this.loadFormData();
  }

  updateFormData = (key, formData) => {
    this.setState(state => {
      let idx = state.ingestion_data.findIndex(x => x.id === key);
      if (idx === -1) {
        console.warn(`No item found for key: ${key}`);
        return;
      }
      const existing_data = state.ingestion_data[idx];
      const data = [
        ...state.ingestion_data.slice(0, idx),
        {
          ...existing_data,
          data: {
            ...existing_data.data,
            ...formData
          }
        },
        ...state.ingestion_data.slice(idx + 1)
      ];
      return { ingestion_data: data };
    });
  };

  saveData = () => {
    console.warn("Attempting to save data...");
    return;
    this.setState({ loading: true });
    console.warn("Attempting to save:");
    console.warn(this.state.ingestion_data, this.props);
    const data = {
      target: parseInt(this.props.target.path, 10),
      entries: this.state.ingestion_data.map(formData => ({
        ingestion_id: formData.id,
        // remove empty strings
        ...pickBy(formData.data, x => x !== "")
      }))
    };
    ingest(data).then(resp => {
      console.log(resp);
      this.setState({ loading: false });
    });
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
    console.log(this.props.ingestion);
    return (
      <BatchIngest
        ingestionFiles={this.props.ingestion.entries}
        {...this.props.ingestion.options}
        onChange={this.updateFormData}
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
    saveIngestionData
  }
)(Ingest);
