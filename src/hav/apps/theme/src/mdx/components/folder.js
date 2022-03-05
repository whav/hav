import React from "react";
import useSWR from "swr";
import fetcher from "../utils/fetcher";

import { MediaPreview } from "./media";

const Node = (props) => {
  const { id, media_id, caption } = props;

  const { data, error } = useSWR(`/api/public/node/${id}/`, fetcher);

  if (!data) {
    return null;
  }

  if (error) {
    <div>failed to load</div>;
  }

  // grab defaults from data
  let preview_media_id = media_id || data.representative_media_id;
  let title = caption || data.name || "";
  let url = data.url;

  return (
    <a href={url}>
      <div className="tile">
        <div className="preview">
          {preview_media_id && <MediaPreview id={preview_media_id} />}
        </div>
      </div>
      <div className={"caption"}>{title}</div>
    </a>
  );
};

export default Node;
