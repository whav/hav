import React from "react";
import ArchiveFile from "./assets";

import { Header } from "../Header";

import License from "../../license";
import {
  DisplayTimeFrame,
  DisplayTimeStamp,
  DisplayYearRange,
} from "./details";
import { TagList } from "../../tags";

const DetailTable = ({ title = "", details = {}, className = "" }) => {
  return (
    <>
      <h3>{title}</h3>
      <dl
        className="grid gap-x-4"
        style={{ gridTemplateColumns: "max-content auto" }}
      >
        {Object.entries(details).map(([name, value]) => (
          <React.Fragment key={name}>
            <dt className="col-start-1 text-gray-400">{name}</dt>
            <dd className="col-start-2">{value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </>
  );
};

const CreatorList = ({ creators = [] }) => {
  return (
    <ul className="inline-block list-none">
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
  const details = {
    "hav media handle": media.id,
    permalink: "-",
    license: <License {...media.license} />,
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
  } = media;
  const collection_slug = collection?.slug;
  return (
    <>
      <Header
        title={title}
        collection_slug={collection_slug}
        ancestors={ancestors}
        search={false}
      />

      <div className="flex flex-row flex-wrap space-x-4 space-y-4 pt-6">
        {media.files.map((f, index) => (
          <div
            className="flex-auto xl:max-w-screen-md"
            style={{ minWidth: 500 }}
            key={index}
          >
            <figure className="pr-10 pb-10">
              <ArchiveFile key={index} {...f} />
              <figcaption className="flex justify-between">
                <div>
                  <CreatorList creators={media.creators} /> (
                  <DisplayYearRange
                    start={media.creationTimeframe[0]}
                    end={media.creationTimeframe[1]}
                  />
                  )
                </div>
                <License {...license} />
              </figcaption>
            </figure>
          </div>
        ))}

        <div className="flex-none">
          <PrimaryDetailTable media={media} />
        </div>
        <div className="flex-none">
          <SecondaryDetailTable media={media} />
        </div>
        <TagList tags={tags} />
      </div>

      {/* <hr />
      <div>
      <h3>Debug</h3>
      {tags && (
        <div className="pt-4">
          <Tags tags={tags} />
        </div>
      )}
      <pre>{JSON.stringify(props.media, null, 2)}</pre>
      </div> */}
    </>
  );
};

export default MediaDetail;
