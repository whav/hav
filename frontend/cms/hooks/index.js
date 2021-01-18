import { useRouter } from "next/router";
import useSWR from "swr";

const collectionRe = /^\/collections\/([\w\-]+)\/.*$/;

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
  return collection_slug;
};

const fetcher = (url) => fetch(url).then((r) => r.json());

export const useAPI = (url, query = {}, initialData) => {
  let params;
  if (url && query) {
    // clean query from undefineds
    Object.keys(query).forEach((key) =>
      query[key] === undefined ? delete query[key] : null
    );
    params = new URLSearchParams(query);
    if (params) {
      url = `${url}?${params}`;
    }
  }

  const swrOptions = {};
  if (initialData) {
    swrOptions.initialData = initialData;
  }

  return useSWR(url, fetcher, swrOptions);
};
