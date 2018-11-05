import React from "react";
import { connect } from "react-redux";
import Loading from "../../ui/loading";
import MediaDetail from "../../ui/filebrowser/hav/detail";

import { requestFile } from "../../ducks/browser";
import { buildApiUrl } from "../../api/urls";

class HavMediaDetail extends React.Component {
  constructor(props) {
    super(props);
    this.props.loadData();
  }
  render() {
    const { loading, data } = this.props;
    if (loading) {
      return <Loading />;
    }
    return <MediaDetail details={data} />;
  }
}

export default connect(
  (state, props) => {
    const key = buildApiUrl(props.location.pathname);
    const data = state.repositories[key];
    return {
      loading: data == undefined,
      data
    };
  },
  (dispatch, props) => {
    const url = buildApiUrl(props.location.pathname);
    return {
      loadData: () => dispatch(requestFile(url))
    };
  }
)(HavMediaDetail);
