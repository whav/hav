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
      <form>
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
      <span>{query}</span>
      {data && !error ? (
        <>
          <span className="text-lg font-medium">
            Results for query <em>"{query}"</em>
          </span>

          <SearchResults {...data} />

          <pre className="bg-gray-100">{JSON.stringify(data, null, 2)}</pre>
        </>
      ) : null}
    </>
  );
};

export default SearchPage;
