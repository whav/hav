import React from "react";
import { Button } from "theme-ui";
import { useCollection } from "hooks";

const SearchInput = ({ slug }) => {
  return (
    <>
      <h1>Search collection {slug}</h1>
      <p>This page will soon allow you to search the collection {slug}</p>
      {/* <hr /> */}
      {/* <input type="search" placeholder={`Search collection`} /> */}
      {/* <Button>Search</Button> */}
    </>
  );
};

const SearchPage = () => {
  const collection_slug = useCollection();
  if (!collection_slug) {
    return null;
  }
  return <SearchInput slug={collection_slug} />;
};

export default SearchPage;
