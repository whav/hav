import { useRouter } from "next/router";
import useSWR from "swr";

const collectionRe = /^\/collections\/(\w+)\/.*$/;

export const useCollection = () => {
  const router = useRouter();
  // try to get the collection from the router params
  let { collection_slug } = router.query;
  // if not possible try the regex approach
  if (!collection_slug) {
    const match = router.asPath.match(collectionRe);
    if (match) {
      collection_slug = match[1];
    }
  }

  if (!collection_slug) {
    console.log(
      "hook:",
      collection_slug,
      "query",
      router.query,
      "pathname",
      router.pathname,
      "asPath",
      router.asPath
    );
  }

  return collection_slug;
};

const fetcher = (url) => fetch(url).then((r) => r.json());

export const useAPI = (url, query = {}) => {
  let params;
  if (query) {
    params = new URLSearchParams(query);
  }

  if (params) {
    url = `${url}?${params}`;
  }
  return useSWR(url, fetcher);
};
