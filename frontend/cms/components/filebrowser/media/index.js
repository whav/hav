import React from "react";
import Image from "./image";
import Tags from "./tags";

import Header from "../Header";
import styles from "./media.module.css";

import License from "../../license";
import { DisplayTimeFrame, DisplayTimeStamp } from "./details";

const DetailTable = ({ title = "", details = {} }) => {
  return (
    <>
      <h3>{title}</h3>
      <dl className={styles.inline_dl}>
        {Object.entries(details).map(([name, value]) => (
          <React.Fragment key={name}>
            <dt className={styles.inline_dt}>{name}</dt>
            <dd className={styles.inline_dd}>{value}</dd>
          </React.Fragment>
        ))}
        <dt></dt>
      </dl>
    </>
  );
};

const PrimaryDetailTable = ({ media }) => {
  const details = {
    title: media.title || "-",
    description: media.description || "-",
    affiliation: "-",
    keywords: "-",
    country: "-",
    location: "-",
    "description author": "-",
  };
  return <DetailTable title="Content Description" details={details} />;
};

const SecondaryDetailTable = ({ media }) => {
  console.log(media);
  const details = {
    "hav media handle": "-",
    permalink: "-",
    license: "-",
    "original media type": "-",
    "available formats": "-",
    creator: "-",
    "creation date": (
      <DisplayTimeFrame
        start={media.creationTimeframe[0]}
        end={media.creationTimeframe[1]}
      />
    ),
    "archived by": "-",
    "archiving date": <DisplayTimeStamp ts={media.createdAt} />,
  };
  return <DetailTable title="Media Description" details={details} />;
};

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

      <div className={styles.flexbox_row}>
        <div>
          <Image {...props.media} />
        </div>
        <div style={{ paddingLeft: "2rem" }}>
          <PrimaryDetailTable media={media} />
        </div>
      </div>
      <License {...license} />

      <SecondaryDetailTable media={media} />
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
