import React from "react";
import { connect } from "react-redux";
import { LoadingPage } from "../../ui/loading";
import MediaDetail from "../../ui/filebrowser/hav/detail";

import { requestFile } from "../../ducks/browser";
import { buildApiUrl } from "../../api/urls";

class HavMediaDetail extends React.Component {
  state = {
    loading: true
  };

  constructor(props) {
    super(props);
    this.props.loadData().then(() => this.setState({ loading: false }));
  }
  render() {
    const { loading } = this.state;
    if (loading) {
      return <LoadingPage />;
    }
    const { data } = this.props;

    return <MediaDetail details={data} />;
  }
}

export default connect(
  (state, props) => {
    const key = buildApiUrl(props.location.pathname);
    const data = state.repositories[key];
    return {
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
