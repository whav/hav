import React from "react";
import Image from "./image";
import Tags from "./tags";

import styles from "./media.module.css";

const MediaDetail = ({ media }) => {
  return (
    <>
      <h1>{media.title}</h1>

      <div className={styles.mediaContainer}>
        <Image {...media} />
      </div>
      {media.tags && (
        <div className={styles.tags}>
          <Tags tags={media.tags} />
        </div>
      )}
      <pre>{JSON.stringify(media, null, 2)}</pre>
    </>
  );
};

export default MediaDetail;
