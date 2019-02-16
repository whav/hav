import React from "react";
import { connect } from "react-redux";
import DetailView from "../../ui/filebrowser/detail";
import { clearIngestionQueue, queueForIngestion } from "../../ducks/ingest";

class MediaDetail extends React.Component {
  render() {
    return <DetailView {...this.props.data} ingest={this.props.ingest} />;
  }
}

export default connect(
  null,
  (dispatch, props) => {
    return {
      ingest: () => {
        dispatch(clearIngestionQueue());
        dispatch(queueForIngestion([props.data.url]));
      }
    };
  }
)(MediaDetail);
