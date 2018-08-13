import React from "react";
import { connect } from "react-redux";
import DetailView from "../../ui/filebrowser/detail";

class MediaDetail extends React.Component {
  render() {
    return <DetailView {...this.props.data} />;
  }
}

export default connect()(MediaDetail);
