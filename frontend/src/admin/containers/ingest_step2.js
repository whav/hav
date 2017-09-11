import React from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../ui/loading";
import { fetchDataForIngestionForms } from "../api/ingest";

class Ingest extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
    this.loadFormData = this.loadFormData.bind(this);
    this.loadFormData();
  }

  loadFormData() {
    fetchDataForIngestionForms(
      this.props.files.map(f => f.url),
      this.props.target.url
    ).then(response => this.setState({ response, loading: false }));
  }

  render() {
    const { files, target } = this.props;
    if (this.state.loading) {
      return <LoadingIndicator />;
    }
    return (
      <div>
        <h2>Response</h2>
        {this.state.response
          ? <pre>
              {JSON.stringify(this.state.response, null, 2)}
            </pre>
          : null}
        <hr />
        <h2>Request Params</h2>
        <pre>
          {JSON.stringify(files, null, 2)}
        </pre>
        <pre>
          {JSON.stringify(target, null, 2)}
        </pre>
      </div>
    );
  }
}

export default connect(
  (state, ownProps) => {
    const { target, files } = ownProps.location.state;
    console.log(ownProps.location.state);
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
