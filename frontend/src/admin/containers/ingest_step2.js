import React from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../ui/loading";
import { fetchDataForIngestionForms } from "../api/ingest";
import BatchIngest from "../ui/ingest/step2.js";

class Ingest extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
    this.loadFormData = this.loadFormData.bind(this);
    this.loadFormData();
  }

  loadFormData() {
    fetchDataForIngestionForms(
      this.props.files.map(f => f.file_path),
      this.props.target.url
    ).then(response => this.setState({ response, loading: false }));
  }

  render() {
    const { files, target } = this.props;
    if (this.state.loading) {
      return <LoadingIndicator />;
    }
    return <BatchIngest ingestionFiles={files} />;
  }
}

export default connect(
  (state, ownProps) => {
    const { target, files } = ownProps.location.state;
    return {
      target,
      files
    };
  },
  (dispatch, ownProps) => {
    const { target, files } = ownProps.location.state;
    return {
      loadFormData: () => console.log(target, files)
    };
  }
)(Ingest);
