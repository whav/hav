import React from "react";

const MediaDetail = (props) => {
  return <pre>{JSON.stringify(props, null, 2)}</pre>;
};

export default MediaDetail;
