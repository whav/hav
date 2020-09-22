import React from "react";
import Image from "./image";
import Tags from "./tags";
import { Link } from "components";
import Breadcrumbs from "components/navigation/breadcrumbs";

import styles from "./media.module.css";

const MediaDetail = (props) => {
  const { media } = props;
  const { ancestors = [], tags = [], collection = {}, title } = media;
  const collection_slug = collection?.slug;
  return (
    <>
      <h1>{title}</h1>
      <Breadcrumbs>
        {ancestors.map((a) => (
          <Link
            key={`set-${a.id}`}
            href={`/collections/${collection_slug}/browse/${a.id}/`}
          >
            <a>{a.name}</a>
          </Link>
        ))}
      </Breadcrumbs>
      <div className={styles.mediaContainer}>
        <Image {...props.media} />
      </div>
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
