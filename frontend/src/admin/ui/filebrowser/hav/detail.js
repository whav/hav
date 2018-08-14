import React from "react";

import { Audio, Video, Image } from "../../components/webassets";

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
  render() {
    const { details } = this.props;
    return (
      <div>
        {details && details.preview_url ? (
          <div>
            <img src={details.preview_url} />
          </div>
        ) : null}

        <h3>WebAssets</h3>

        {details &&
          details.webassets.map((wa, index) => (
            <WebAsset key={index} {...wa} />
          ))}

        <h3>Props</h3>

        <pre>{JSON.stringify(details, null, 2)}</pre>
      </div>
    );
  }
}

export default HavMediaDetail;
