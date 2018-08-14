import React from "react";
import { connect } from "react-redux";
import Loading from "../../ui/loading";
import MediaDetail from "../../ui/filebrowser/hav/detail";

class HavMediaDetail extends React.Component {
  state = { loading: true };

  componentDidMount() {
    fetch(`/api/v1/hav/media/${this.props.match.params.media_id}/`, {
      method: "GET",
      credentials: "same-origin",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json"
      })
    })
      .then(resp => resp.json())
      .then(data => this.setState({ details: data, loading: false }));
  }
  render() {
    if (this.state.loading) {
      return <Loading />;
    }
    return <MediaDetail details={this.state.details} />;
  }
}

export default connect()(HavMediaDetail);
