import React from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../../ui/loading";
import { fetchDataForIngestionForms } from "../../api/ingest";
import BatchIngest from "../../ui/ingest/step2.js";

class Ingest extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
    this.loadFormData();
  }

  updateFormData = (key, name, value) => {
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
            [name]: value
          }
        },
        ...state.ingestion_data.slice(idx + 1)
      ];
      console.log(idx, data[idx].id, data[idx].data, data);
      return { ingestion_data: data };
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
    return (
      <BatchIngest
        ingestionFiles={ingestion_data}
        {...options}
        onChange={this.updateFormData}
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
