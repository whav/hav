import React from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../../ui/loading";
import { fetchDataForIngestionForms, ingest } from "../../api/ingest";
import BatchIngest from "../../ui/ingest/step2.js";
import pickBy from "lodash/pickBy";

class Ingest extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
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
    fetchDataForIngestionForms(
      this.props.files.map(f => f.file_path),
      this.props.target.url
    ).then(response => {
      this.setState({
        ingestion_data: response.files.map(f => {
          return {
            id: f.ingest_id,
            data: {
              ...f.initial_data
            }
          };
        }),
        options: response.options,
        loading: false
      });
    });
  };

  render() {
    if (this.state.loading) {
      return <LoadingIndicator />;
    }
    const { options, ingestion_data } = this.state;
    console.log(ingestion_data);
    return (
      <BatchIngest
        ingestionFiles={ingestion_data}
        {...options}
        onChange={this.updateFormData}
        onSave={this.saveData}
      />
    );
  }
}

export default connect((state, ownProps) => {
  const { target, files } = ownProps.location.state;
  return {
    target,
    files
  };
})(Ingest);
