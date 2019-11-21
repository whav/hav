import React from "react";
import { connect } from "react-redux";
import { requestFile } from "../../ducks/browser";

class SourcePreview extends React.Component {
  componentDidMount() {
    if (this.props.data === undefined) {
      this.props.loadData();
    }
  }
  render() {
    if (this.props.data === undefined) {
      return null;
    }
    return (
      <figure>
        <img src={this.props.data.preview_url} />
        <figcaption>{this.props.data.name}</figcaption>
      </figure>
    );
  }
}

export default connect(
  (state, ownProps) => {
    const identifier = ownProps.url;
    // buildApiUrl(identifier);
    const data = state.repositories[identifier];
    return {
      data
    };
  },
  (dispatch, ownProps) => {
    const url = ownProps.url;
    return {
      loadData: () => {
        dispatch(requestFile(url));
      }
    };
  }
)(SourcePreview);
