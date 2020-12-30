import React, { useState } from "react";
import Link from "next/link";
import { FolderIcon, SearchIcon } from "../icons";

const SearchBar = ({ query = "", node = "", onQuery }) => {
  const [value, setQuery] = useState(query);

  return (
    <form
      className="shadow flex"
      onSubmit={(e) => {
        e.preventDefault();
        onQuery && onQuery(value);
      }}
    >
      <input
        className="w-full rounded p-2"
        type="text"
        value={value}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search collection`}
      />
      <input type="hidden" value={node} />
      <button className="bg-white w-auto flex justify-end items-center text-blue-500 p-2 hover:text-blue-400">
        <SearchIcon />
      </button>
    </form>
  );
};

const HeaderSearchBar = ({ target, node }) => {
  const [query, setQuery] = useState("");

  return (
    <form className="shadow flex" action={target} method="get">
      <input
        className="w-full rounded p-2"
        type="text"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search collection`}
      />
      <input type="hidden" name="node" value={node} />
      <button className="bg-white w-auto flex justify-end items-center text-blue-500 p-2 hover:text-blue-400">
        <SearchIcon />
      </button>
    </form>
  );
};

const SearchResults = ({ hits = [] }) => {
  return (
    <>
      {hits.map((hit) => (
        <div className="mb-4 p-2" key={hit.id}>
          <SearchResult {...hit} />
        </div>
      ))}
    </>
  );
};

const HighlightedText = ({ text = "", matches = [] }) => {
  if (matches.length === 0) {
    return <>{text}</>;
  }
  let highlightedRanges = [];
  matches.forEach(({ start, length }) => {
    highlightedRanges.push([start, start + length]);
  });

  const results = matches.reduce(
    (previousSegments, match, index, allMatches) => {
      const { start, length } = match;
      const end = start + length;
      // deal with first iteration
      if (index === 0) {
        previousSegments.push(text.slice(0, start));
      }

      // deal with text between this match and the previous one
      const previousMatch = allMatches[index - 1];
      if (previousMatch) {
        const previousEnd = previousMatch.start + previousMatch.length;
        previousSegments.push(text.slice(previousEnd, start));
      }

      // add the highlighted segment
      previousSegments.push(
        <span className="underline bg-blue-100">{text.slice(start, end)}</span>
      );

      // deal with last iteration
      if (index === allMatches.length - 1) {
        previousSegments.push(text.slice(end));
      }
      return previousSegments;
    },
    []
  );
  return results;
};

const SearchResult = ({
  thumbnail,
  title,
  body,
  additional_titles = [],
  type,
  _matchesInfo = {},
  collection,
  pk,
}) => {
  additional_titles = additional_titles.flat(10).join(" ");
  let url = `/collections/${collection}`;
  let Icon = () => <span />;
  switch (type) {
    case "folder":
      url = `${url}/browse/${pk}/`;
      Icon = FolderIcon;
      break;
    case "media":
      url = `${url}/media/${pk}/`;
      break;
    default:
      throw `Unknown type ${type}`;
  }
  return (
    <div className="flex">
      <div className="flex-1 pl-4 order-last">
        <Link href={url}>
          <a className="text-lg font-bold">
            <Icon className="inline" />
            <HighlightedText matches={_matchesInfo.title} text={title} />
          </a>
        </Link>

        <p>
          <HighlightedText
            matches={_matchesInfo.additional_titles}
            text={additional_titles}
          />
        </p>

        <p className="text-base">
          <HighlightedText matches={_matchesInfo.body} text={body} />
        </p>
      </div>
      <div className="mw-1/3">
        <img src={thumbnail} />
      </div>
    </div>
  );
};

export { SearchResults, SearchResult, SearchBar, HeaderSearchBar };
