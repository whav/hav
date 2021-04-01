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
import { DownloadIcon } from "../../icons";
import { Table } from "../../shared/table";

const DetailTable = ({ title = "", subtitle = "", details = {} }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          {Object.entries(details).map(([name, value], index) => {
            const gray = index % 2 === 0;
            return (
              <div
                className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${
                  gray ? "bg-gray-50" : "bg-white"
                }`}
                key={name}
              >
                <dt className="text-sm font-medium text-gray-500">{name}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
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

const FileTable = ({ files = [] }) => {
  return (
    <ul className="inline-block list-none">
      {files.map((f) => (
        <li key={f.id}>
          {f.originalFilename}{" "}
          <a href={f.downloadUrl}>
            <DownloadIcon className="inline" />{" "}
          </a>
        </li>
      ))}
    </ul>
  );
};

const AllFiles = ({ files = [] }) => {
  const headers = ["filename", "size", "permalink"];
  const rows = files.map((f) => [
    f.originalFilename,
    f.size,
    <a href={f.permalink}>
      <DownloadIcon className="inline" />{" "}
    </a>,
  ]);

  return <Table headers={headers} rows={rows} />;
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

const SecondaryDetailTable = ({ media, file }) => {
  const details = {
    "hav media handle": media.id,
    license: <License {...media.license} />,
    "original media type": media?.originalMediaType?.name,
    "original file name": <FileTable files={media.files} />,
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
  const { ancestors = [], collection = {}, title, license = {} } = media;
  const primaryFile = media.files[0];
  console.log(primaryFile);
  const collection_slug = collection?.slug;
  return (
    <>
      <Header
        title={title}
        collection_slug={collection_slug}
        ancestors={ancestors}
        search={false}
      />

      <div className="md:flex md:flex-row md:flex-wrap pt-6">
        <div className="flex-auto max-w-2xl mr-4 mb-4">
          <figure className="md:pr-10 md:pb-10">
            <ArchiveFile {...primaryFile} />
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
        <div className="md:max-w-lg mr-4 mb-4">
          <PrimaryDetailTable media={media} file={primaryFile} />
        </div>
        <div className="md:max-w-lg mr-4 mb-4">
          <SecondaryDetailTable media={media} file={primaryFile} />
          <div className="pt-4">
            <AllFiles files={media.files} />
          </div>
        </div>
      </div>
    </>
  );
};

export default MediaDetail;
