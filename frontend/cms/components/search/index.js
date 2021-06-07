import React, { useState } from "react";
import Link from "next/link";
import { FolderIcon, SearchIcon } from "../icons";
import { Button } from "../buttons";

const SearchBar = ({ query = "", node = "", onQuery }) => {
  const [value, setQuery] = useState(query);

  return (
    <form
      className="flex"
      onSubmit={(e) => {
        e.preventDefault();
        onQuery && onQuery(value);
      }}
    >
      <input
        className="w-full p-3 shadow rounded border-0 focus:bg-gray-500 ml-4"
        type="text"
        value={value}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search collection`}
      />
      <input type="hidden" value={node} />
      <Button primary={true}>
        <SearchIcon /> Search
      </Button>
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
  console.log(text, matches);
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
