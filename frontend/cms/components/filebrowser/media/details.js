import React from "react";
import { parseISO, format as dfn_format } from "date-fns";

const format = (ts, format = "PPpp") => dfn_format(ts, format);

const CompactTimeFrameDisplay = ({ timestamp, resolution = "" }) => {
  resolution = resolution.toLowerCase();
  switch (resolution) {
    case "year":
      return format(timestamp, "yyyy");
    case "month":
      return format(timestamp, "LLL, yyyy");
    case "day":
      return format(timestamp, "PP");
    default:
      return format("PPpp");
  }
};

const DisplayTimeFrame = ({ start, end, resolution }) => {
  try {
    start = parseISO(start);
    end = parseISO(end);
  } catch {
    return `${start} - ${end}`;
  }

  let range_display = `${format(start)} - ${format(end)} (${resolution})`;
  if (resolution) {
    range_display = (
      <span title={range_display}>
        <CompactTimeFrameDisplay timestamp={start} resolution={resolution} />
      </span>
    );
  }
  return range_display;
};

const DisplayTimeStamp = ({ ts }) => {
  let d = parseISO(ts);
  return format(d);
};

const DisplayYearRange = ({ start, end }) => {
  start = parseISO(start);
  end = parseISO(end);
  let display = (
    <CompactTimeFrameDisplay timestamp={start} resolution={"year"} />
  );

  if (start.year == end.year) {
    return display;
  } else {
    return (
      <>
        {display} /{" "}
        <CompactTimeFrameDisplay timestamp={end} resolution={year} />
      </>
    );
  }
};

export { DisplayTimeFrame, DisplayTimeStamp, DisplayYearRange };
