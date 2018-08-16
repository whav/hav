import React from "react";
import { connect } from "react-redux";
import DetailView from "../../ui/filebrowser/detail";
import { clearIngestionQueue, queueForIngestion } from "../../ducks/ingest";

class MediaDetail extends React.Component {
  render() {
    const ingest = () => this.props.queueForIngestion(this.props.data.url);
    return <DetailView {...this.props.data} ingest={ingest} />;
  }
}

export default connect(
  null,
  (dispatch, props) => ({
    queueForIngestion: ingest_id => {
      dispatch(clearIngestionQueue());
      dispatch(queueForIngestion([ingest_id]));
    }
  })
)(MediaDetail);
