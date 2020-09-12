import { useRouter } from "next/router";

const collectionRe = /^\/collections\/(\w+)\/.*$/;

export const useCollection = () => {
  const router = useRouter();
  // try to get the collection from the router params
  let { collection_slug } = router.query;

  // if not possible try the regex approach
  if (!collection_slug) {
    if (!collection_slug) {
      const match = router.asPath.match(collectionRe);
      if (match) {
        collection_slug = match[1];
      }
    }
  }
  return collection_slug;
};
