import React from "react";
import { Button } from "hav-ui";
import { useRouter } from "next/router";

const SearchInput = () => {
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
  return <SearchInput />;
};

export default SearchPage;
