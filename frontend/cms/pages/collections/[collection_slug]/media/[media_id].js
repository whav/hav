import React from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { useAPI } from "hooks";

const fetcher = (url) => fetch(url).then((r) => r.json());

const MediaDetail = (props) => {
  const router = useRouter();
  const { media_id } = router.query;
  const { data } = useAPI("/api/media/", { media_id });
  return <pre>{JSON.stringify({ props, data }, null, 2)}</pre>;
};

const Loader = () => (
  // <Suspense fallback={<div>Llllloading...</div>}>
  <MediaDetail />
  // </Suspense>
);

export default Loader;
