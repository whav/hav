import React from "react";
import Image from "./image";
import Tags from "./tags";

import ArchiveFile from "./assets";

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

const CreatorList = ({ creators = [] }) => {
  return (
    <ul className={styles.detail_listing}>
      {creators.map(({ firstName, lastName }, index) => (
        <li key={index}>
          {firstName} {lastName}
        </li>
      ))}
    </ul>
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
    "hav media handle": media.id,
    permalink: "-",
    license: "-",
    "original media type": media?.originalMediaType?.name,
    "available formats": "-",
    "creator(s)": <CreatorList creators={media.creators} />,
    "creation date": (
      <DisplayTimeFrame
        start={media.creationTimeframe[0]}
        end={media.creationTimeframe[1]}
        resolution={media.creationTimeframeResolution}
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
    files = [],
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
          {media.files.map((f, index) => (
            <ArchiveFile key={index} {...f} />
          ))}
        </div>
        <div style={{ paddingLeft: "2rem" }}>
          <PrimaryDetailTable media={media} />
        </div>
      </div>
      <License {...license} />

      <SecondaryDetailTable media={media} />

      <hr />

      <h3>Debug</h3>
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
