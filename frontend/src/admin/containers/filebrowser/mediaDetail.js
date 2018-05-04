import React from "react";
import { connect } from "react-redux";

class HavMediaDetail extends React.Component {
  state = {
    details: null
  };
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
      .then(data => this.setState({ details: data }));
  }
  render() {
    return (
      <div>
        {this.state.details && this.state.details.preview_url ? (
          <div>
            <img src={this.state.details.preview_url} />
          </div>
        ) : null}
        <pre>{JSON.stringify(this.state.details || this.props, null, 2)}</pre>
      </div>
    );
  }
}

export default HavMediaDetail;
