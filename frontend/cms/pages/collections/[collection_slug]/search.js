import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useCollection, useAPI } from "hooks";
import { SearchResults, SearchBar } from "components/search";
import Breadcrumbs from "components/navigation/breadcrumbs";
import { Header } from "components/filebrowser/Header";

const SearchPage = ({
  initialQuery = "",
  initialRootNode = "",
  initialCollection = {},
}) => {
  // Fetch collection data
  const collectionSlug = useCollection();
  const { data: collections = [], error: collectionsError } = useAPI(
    "/api/collections/",
    initialCollection
  );
  const collection =
    collections.find((c) => c.slug === collectionSlug) || initialCollection;

  const [node, setNode] = useState(initialRootNode || collection?.rootNode);
  const [query, setQuery] = useState(initialQuery);

  // fetch folder/set data
  const { data: folder } = useAPI(
    collectionSlug && node ? `/api/sets/` : null,
    {
      collection: collectionSlug,
      set: node,
    }
  );
  const ancestors = folder?.ancestors || [];

  const router = useRouter();

  useEffect(() => {
    console.log(router.isReady);
    const newParams = new URLSearchParams();
    if (query) {
      newParams.set("q", query);
    }
    if (node !== collection?.rootNode) {
      newParams.set("node", node);
    }
    if (newParams.toString() !== window.location.search.substring(1)) {
      const searchParams = {};
      for (const [key, value] of newParams) {
        searchParams[key] = value;
      }
      router.replace(
        {
          pathname: window.location.pathname,
          query: searchParams,
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

  if (!collectionSlug) {
    return null;
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold mb-4">
        Search in collection "<em>{collection.name}"</em>
      </h1>
      <Breadcrumbs>
        {ancestors.map(({ name, id }) => (
          <button
            key={id}
            onClick={(e) => {
              e.preventDefault();
              setNode(id);
            }}
          >
            {name}
          </button>
        ))}
        {folder && <span key={node}>{folder.name}</span>}
      </Breadcrumbs>
      <div className="py-4">
        <SearchBar
          query={query}
          onQuery={(q) => {
            setQuery(q);
          }}
        />
      </div>

      {/* {folder && <pre>{JSON.stringify(folder, null, 2)}</pre>} */}
      {data && !error ? (
        <div className="mt-4">
          <div className="text-base font-medium pb-4">
            {data.nbHits} Result{data.nbHits === 1 ? "" : "s"} for query{" "}
            <em>"{query}"</em>
          </div>

          <SearchResults {...data} />

          {/* <pre className="bg-gray-100">{JSON.stringify(data, null, 2)}</pre> */}
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
      initialCollection: collection,
    },
  };
}

export default SearchPage;
