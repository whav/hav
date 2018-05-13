import React from "react";

class MediaDetail extends React.Component {
  render() {
    return (
      <div className="container">
        <h1>File Detail</h1>
        <pre>{JSON.stringify(this.props, null, 2)}</pre>
      </div>
    );
  }
}

export default MediaDetail;
