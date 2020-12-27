import React, { useState } from "react";
import { useCollection } from "hooks";
import { useAPI } from "hooks";
import { useDebounce } from "use-debounce";
import { SearchResults } from "components/search";

const SearchPage = () => {
  const collection_slug = useCollection();
  const [query, setQuery] = useState("");

  const [debouncedQuery] = useDebounce(query, 1000);

  const { data, error } = useAPI(
    query.length === 0 ? null : `/api/rest/public/search/`,
    {
      query: debouncedQuery,
    }
  );
  if (!collection_slug) {
    return null;
  }

  return (
    <>
      <h1>Search collection {collection_slug}</h1>
      <form className="mb-4">
        <input
          className="border rounded-md inline-block"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          placeholder={`Search collection`}
        />
      </form>
      {data && !error ? (
        <div className="mt-4">
          <div className="text-base font-medium text-right">
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

export default SearchPage;
