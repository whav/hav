import React from "react";

const Media = ({ media }) => {
  return (
    <div className="media">
      <div className="media-left">
        <img src={media.preview_url} />
      </div>
      <div className="media-content">
        <h2>{media.title}</h2>
      </div>
    </div>
  );
};

export default Media;
