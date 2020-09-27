import React from "react";

const Image = ({ thumbnailUrl, srcset, title }) => {
  return (
    <img
      src={thumbnailUrl}
      srcSet={srcset.join(",")}
      title={title}
      alt={title}
    />
  );
};

export default Image;
