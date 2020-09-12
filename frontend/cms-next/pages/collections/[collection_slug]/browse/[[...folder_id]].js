import React from "react";
import useSWR from "swr";
import { useCollection } from "hooks";

const fetcher = (url) => fetch(url).then((r) => r.json());

const CollectionBrowser = (props) => {
  console.log(props);
  const collection_slug = useCollection();
  const params = new URLSearchParams({
    collection: collection_slug,
    set: 43,
  });
  const { data } = useSWR(`/api/sets/?${params}`, fetcher);

  return (
    <>
      <h1>Browse collection</h1>
      <p>This page will allow you to browse the collection.</p>
      <pre>{JSON.stringify({ props, data }, null, 2)}</pre>
    </>
  );
};

export default CollectionBrowser;
