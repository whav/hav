import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useCollection, useAPI } from "hooks";
import { SearchResults, SearchBar } from "components/search";

const SearchPage = ({
  initialQuery = "",
  initialRootNode = "",
  initialCollection = {},
}) => {
  const collection_slug = useCollection();
  const { data: collections = [], error: collections_error } = useAPI(
    "/api/collections/",
    initialCollection
  );

  const collection = collections.find((c) => c.slug === collection_slug);
  const [query, setQuery] = useState(initialQuery);
  const node = initialRootNode || collection?.rootNode;
  const router = useRouter();

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (query) {
      newParams.set("q", query);
    }
    if (node !== collection?.rootNode) {
      newParams.set("node", node);
    }
    // console.log(
    //   newParams.toString(),
    //   window.location.search.substring(1),
    //   node,
    //   collection?.rootNode
    // );
    if (newParams.toString() !== window.location.search.substring(1)) {
      router.replace(
        {
          pathname: window.location.pathname,
          query: { q: query, node },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [query, node]);

  // actually fetch the results
  const { data, error } = useAPI(
    query.length > 0 && node ? `/api/rest/public/search/` : null,
    {
      query,
      node,
    }
  );

  if (!collection_slug) {
    return null;
  }

  return (
    <>
      <SearchBar
        query={query}
        onQuery={(q) => {
          console.warn(q);
          setQuery(q);
        }}
      />
      {/* {collection && <pre>{JSON.stringify(collection, null, 2)}</pre>} */}
      {data && !error ? (
        <div className="mt-4">
          <div className="text-base font-medium">
            {data.nbHits} Result{data.nbHits === 1 ? "" : "s"} for query{" "}
            <em>"{query}"</em>
          </div>

          <SearchResults {...data} />

          <pre className="bg-gray-100">{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : null}
    </>
  );
};

export async function getServerSideProps({
  query: { q = "", node = "", collection_slug },
}) {
  const getCollectionBySlug = require("../../api/collections")
    .getCollectionBySlug;
  const collection = await getCollectionBySlug(collection_slug);

  return {
    props: {
      initialQuery: q,
      initialRootNode: node,
      initialCollection: {},
    },
  };
}

export default SearchPage;
