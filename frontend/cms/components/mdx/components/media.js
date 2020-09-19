import React from "react";
import { useAPI } from "hooks";

const Image = ({ media, caption, title, url }) => {
  return (
    <figure>
      <img
        alt={media.title}
        src={media.thumbnailUrl}
        srcSet={media.srcset.join(", ")}
      />
      <figcaption>{caption}</figcaption>
    </figure>
  );
};

const MediaSwitch = (props) => {
  return <Image {...props} />;
};

const Media = (props) => {
  console.log(props);
  const { id } = props;
  const { loading, data, ...other } = useAPI("/api/media/", { id });
  if (!data) {
    return <h1>Loading...</h1>;
  }
  console.log(loading, data, other);
  return <MediaSwitch {...data} />;
};

export default Media;
