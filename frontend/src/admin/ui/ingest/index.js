import React from "react";
import { FallBackImageLoader } from "../filebrowser/index";

const PreviouslyIngestedMedia = ({ media }) => (
  <div className="box media">
    <div className="media-left">
      <figure className="image is-128x128">
        <FallBackImageLoader
          src={media.preview_url}
          mime_type={media.mime_type}
        />
      </figure>
    </div>
    <div className="media-content">
      <h2>{media.title}</h2>
      <p>
        <strong>{media.msg || media.name}</strong>
      </p>
    </div>
  </div>
);

export { PreviouslyIngestedMedia };
