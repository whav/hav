import React from "react";
import { useRouter } from "next/router";
import { useAPI } from "hooks";

import { Loading } from "components";
import MediaDetail from "components/media";

const MediaDetailPage = (props) => {
  const router = useRouter();
  const { media_id } = router.query;
  const { data } = useAPI("/api/media/", { mediaId: media_id });
  if (!data) {
    return <Loading />;
  }
  return <MediaDetail {...data} />;
};

export default MediaDetailPage;
