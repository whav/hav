import React, { useState } from "react";
import Link from "next/link";
import { FolderIcon, SearchIcon } from "../icons";
import { Button } from "../buttons";

const SearchBar = ({ query = "", node = "", onQuery }) => {
  const [value, setQuery] = useState(query);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onQuery && onQuery(value);
      }}
      className="mt-1 flex rounded-md shadow-sm"
    >
      <input type="hidden" value={node} />
      <div className="relative flex items-stretch flex-grow focus-within:z-10">
        <input
          type="text"
          value={value}
          onChange={(e) => setQuery(e.target.value)}
          name="query"
          className="focus:ring-grey-500 focus:border-grey-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
          placeholder={`Search collection`}
        />
      </div>
      <button className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
        <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        <span>Search</span>
      </button>
    </form>
  );
};

const HeaderSearchBar = ({ target, node }) => {
  const [query, setQuery] = useState("");

  return (
    <form className="flex rounded shadow" action={target} method="get">
      <input
        className="w-full p-2 unstyled"
        type="text"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search collection`}
      />
      <input type="hidden" name="node" value={node} />
      <button className="w-auto flex justify-end items-center e-500 p-2 hover:text-blue-400">
        <SearchIcon />
      </button>
    </form>
  );
};

const SearchResults = ({ hits = [] }) => {
  return (
    <div className="divide-y divide-gray-200">
      {hits.map((hit) => (
        <div className="p-4" key={hit.id}>
          <SearchResult {...hit} />
        </div>
      ))}
    </div>
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

  const build_fragment = (text, key, highlight = false) => {
    const cn = highlight ? "bg-blue-100" : "";
    return (
      <span className={cn} key={key}>
        {text}
      </span>
    );
  };
  const results = matches.reduce(
    (previousSegments, match, index, allMatches) => {
      const { start, length } = match;
      const end = start + length;
      // deal with first iteration
      if (index === 0) {
        previousSegments.push(build_fragment(text.slice(0, start), -1));
      }

      // deal with text between this match and the previous one
      const previousMatch = allMatches[index - 1];
      if (previousMatch) {
        const previousEnd = previousMatch.start + previousMatch.length;
        previousSegments.push(
          build_fragment(text.slice(previousEnd, start), index * -1)
        );
      }

      // add the highlighted segment
      previousSegments.push(
        build_fragment(text.slice(start, end), index, true)
      );

      // deal with last iteration
      if (index === allMatches.length - 1) {
        previousSegments.push(build_fragment(text.slice(end), index + 1));
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
            <HighlightedText
              matches={_matchesInfo.title}
              text={title || "Untitled"}
            />
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
