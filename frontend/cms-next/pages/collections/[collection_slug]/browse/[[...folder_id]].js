import React from "react";

const CollectionBrowser = (props) => {
  return <pre>{JSON.stringify(props, null, 2)}</pre>;
};

export default CollectionBrowser;
