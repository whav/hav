import React from "react";
import { useRouter } from "next/router";
import { useAPI } from "hooks";

const BrowseCollection = () => {
  const router = useRouter();

  const { collection_slug } = router.query;
  const { data = [] } = useAPI("/api/collections/", {});
  const current_collection = data.find((c) => c.slug == collection_slug);
  if (current_collection) {
    router.replace(
      `/collections/${current_collection.slug}/browse/${current_collection.rootNode}/`
    );
  }

  return null;
};

export default BrowseCollection;
