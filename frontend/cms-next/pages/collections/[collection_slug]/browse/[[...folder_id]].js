import React from "react";
import { useRouter } from "next/router";

const CollectionBrowser = (props) => {
  return (
    <>
      <h1>Browse collection</h1>
      <p>This page will allow you to browse the collection.</p>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </>
  );
};

export default CollectionBrowser;
