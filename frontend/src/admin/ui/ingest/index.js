import React from "react";
import { FallBackImageLoader } from "../filebrowser/index";

const PreviouslyIngestedMedia = ({ media }) => (
  <div className="box">
    <div className="media">
      <div className="media-left">
        <figure className="image is-128x128">
          {/* <img src={media.pre / view_url} /> */}
          <FallBackImageLoader
            src={media.preview_url}
            mime_type={media.mime_type}
          />
        </figure>
      </div>
    </div>
    <div className="media-content">
      <div className="content">
        <p>
          <strong>{media.name}</strong>
        </p>
      </div>
    </div>
  </div>
);

export { PreviouslyIngestedMedia };
