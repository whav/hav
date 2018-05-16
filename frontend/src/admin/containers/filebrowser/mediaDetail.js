import React from "react";
import { connect } from "react-redux";

import { Audio, Video, Image } from "../../ui/components/webassets";

const WebAsset = props => {
  switch (props.mime_type.split("/")[0].toLowerCase()) {
    case "audio":
      return <Audio {...props} />;
    case "image":
      return <Image {...props} />;
    case "video":
      return <Video {...props} />;
    default:
      return <pre>{JSON.stringify(props, null, 2)}</pre>;
  }
};

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

        <h3>WebAssets</h3>
        {this.state.details &&
          this.state.details.webassets.map((wa, index) => (
            <WebAsset key={index} {...wa} />
          ))}
        <h3>Props</h3>
        <pre>{JSON.stringify(this.state.details || this.props, null, 2)}</pre>
      </div>
    );
  }
}

export default HavMediaDetail;
