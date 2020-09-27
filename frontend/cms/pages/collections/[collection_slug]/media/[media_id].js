import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAPI } from "hooks";

import { Loading } from "components";
import MediaDetail from "components/filebrowser/media";

const MediaDetailPage = (props) => {
  const router = useRouter();
  const { media_id } = router.query;
  const { data } = useAPI(media_id ? "/api/media/" : false, {
    mediaId: media_id,
  });
  if (!data) {
    return <Loading />;
  }
  return (
    <>
      <Head>
        <title>{`Media: ${data?.media?.title}`}</title>
      </Head>
      <MediaDetail {...data} />
    </>
  );
};

export default MediaDetailPage;
