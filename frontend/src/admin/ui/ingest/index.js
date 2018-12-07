import React from "react";
import { FallBackImageLoader } from "../filebrowser/index";
import { LoadingSpinner } from "../icons";

const PreviouslyIngestedMedia = ({ media }) => {
  // console.warn(media);
  // return <pre>{JSON.stringify(media, null, 2)}</pre>;
  return (
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
        {media.msg ? (
          <span>
            <LoadingSpinner />
            {media.msg}
          </span>
        ) : null}
        <h2>{media.title}</h2>

        {media.description ? <p>{media.description}</p> : null}
        <p>{media.tags.join(", ")}</p>
      </div>
    </div>
  );
};

export { PreviouslyIngestedMedia };
