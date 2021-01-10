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

const DetailTable = ({ title = "", subtitle = "", details = {} }) => {
  return (
    <div class="bg-white shadow overflow-hidden sm:rounded">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>
      </div>
      <div class="border-t border-gray-200">
        <dl>
          {Object.entries(details).map(([name, value], index) => {
            const gray = index % 2 === 0;
            return (
              <div
                class={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${
                  gray ? "bg-gray-50" : "bg-white"
                }`}
                key={name}
              >
                <dt class="text-sm font-medium text-gray-500">{name}</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {value}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
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
    keywords: <TagList tags={media.tags || []} />,
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

      <div className="flex flex-row flex-wrap pt-6">
        {media.files.map((f, index) => (
          <div className="flex-auto m-4 max-w-lg" key={index}>
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
        <div className="w-full md:max-w-md m-4">
          <PrimaryDetailTable media={media} />
        </div>
        <div className="w-full md:max-w-md m-4">
          <SecondaryDetailTable media={media} />
        </div>
        <div className="w-full md:max-w-md m-4">
          <TagList tags={tags} />
        </div>
      </div>
    </>
  );
};

export default MediaDetail;
