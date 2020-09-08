import React from "react";
import { Button } from "theme-ui";
import { useRouter } from "next/router";

const SearchInput = ({ slug }) => {
  return (
    <>
      <input type="search" placeholder={`Search collection`} />
      <Button>Search</Button>
    </>
  );
};

const SearchPage = () => {
  const router = useRouter();
  const { collection_slug } = router.query;
  return <SearchInput slug={collection_slug} />;
};

export default SearchPage;
