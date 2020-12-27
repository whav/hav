import React from "react";
import { match } from "path-to-regexp";

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
        const previousEnd = previousMatch.start + previousMatch.end;
        previousSegments.push(text.slice(previousEnd, start));
      }

      // add the highlighted segment
      previousSegments.push(
        <span className="underline">{text.slice(start, end)}</span>
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
}) => {
  additional_titles = additional_titles.flat(10).join(" ");
  return (
    <div className="flex">
      <div className="flex-1 pr-4">
        <a></a>
        <h2 className="text-lg font-bold">
          <HighlightedText matches={_matchesInfo.title} text={title} />
        </h2>
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

export { SearchResults, SearchResult };
