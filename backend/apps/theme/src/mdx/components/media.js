import React from "react";
import useSWR from "swr";
import fetcher from "../utils/fetcher";

const ImageMedia = ({ title, thumbnail, aspect_ratio, srcset = [] }) => {
  let srcset_attr = "";
  if (srcset.length) {
    srcset_attr = srcset.map(([width, url]) => `${url} ${width}w`).join(", ");
  }

  return (
    <img
      className={"preview-image"}
      alt={title}
      src={thumbnail}
      srcSet={srcset_attr}
      sizes="300px"
    />
  );
};

const MediaSwitch = (props) => {
  return <ImageMedia {...props} />;
};

const MediaPreview = (props) => {
  const { id } = props;
  const { data, error } = useSWR(`/api/public/media/${id}/`, fetcher);
  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return <MediaSwitch {...data} />;
};

const Media = (props) => {
  const { id, caption, link_to_parent_node, link_to_node_with_id } = props;
  const { data, error } = useSWR(`/api/public/media/${id}/`, fetcher);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  // return <ImageMedia {...data} />;

  return (
    // ugly...
    <a
      href={
        link_to_node_with_id
          ? data.set_url.replace(/\d+\/$/, link_to_node_with_id + "/")
          : link_to_parent_node
          ? data.set_url
          : data.url
      }
    >
      <div className="tile">
        <div className="preview">
          <MediaSwitch {...data} {...props} />
        </div>
        <div className={"caption"}>{caption}</div>
      </div>
    </a>
  );
};

export default Media;

export { MediaSwitch, MediaPreview };
