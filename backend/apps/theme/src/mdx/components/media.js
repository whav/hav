import React from "react";
import useSWR from "swr";
import fetcher from "../utils/fetcher";

const ImageMedia = ({ title, thumbnail }) => {
  return <img alt={title} src={thumbnail} />;
};

const MediaSwitch = (props) => {
  return <ImageMedia {...props} />;
};

const Media = (props) => {
  const { id, caption, sizes, width } = props;
  const { data, error } = useSWR(`/d/api/public/media/${id}/`, fetcher);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  // return <ImageMedia {...data} />;
  return (
    <a href={data.url}>
      <div className="max-w-sm m-4">
        {caption && <div>{caption}</div>}
        <MediaSwitch {...data} {...props} />
      </div>
    </a>
  );
};

export default Media;
