import { useRouter } from "next/router";
import useSWR from "swr";

import getCsrfCookie from "lib/django/csrf";

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

  return collection_slug;
};

const fetcher = async (url) => {
  const res = await fetch(url, { headers: { "X-CSRFToken": getCsrfCookie() } });

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  return await res.json();
};

export const useAPI = (url, query = {}) => {
  let params;
  if (query) {
    // clean query from undefineds
    Object.keys(query).forEach((key) =>
      query[key] === undefined ? delete query[key] : null
    );
    params = new URLSearchParams(query);
    if (params) {
      url = `${url}?${params}`;
    }
  }

  return useSWR(url, fetcher);
};
