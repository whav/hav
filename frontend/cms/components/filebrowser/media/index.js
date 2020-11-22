import React from "react";
import Image from "./image";
import Tags from "./tags";

import Header from "../Header";
import styles from "./media.module.css";

import License from "../../license";

const MediaDetail = (props) => {
  const { media } = props;
  const {
    ancestors = [],
    tags = [],
    collection = {},
    title,
    license = {},
  } = media;
  const collection_slug = collection?.slug;
  return (
    <>
      <Header
        title={title}
        collection_slug={collection_slug}
        ancestors={ancestors}
      />

      <div className={styles.mediaContainer}>
        <Image {...props.media} />
      </div>
      <License {...license} />
      {tags && (
        <div className={styles.tags}>
          <Tags tags={tags} />
        </div>
      )}
      <pre>{JSON.stringify(props.media, null, 2)}</pre>
    </>
  );
};

export default MediaDetail;
