import React from "react";
import { parseISO, format as dateFnFormat } from "date-fns";

const format = (ts) => dateFnFormat(ts, "Pp");

const DisplayTimeFrame = ({ start, end }) => {
  try {
    start = parseISO(start);
    end = parseISO(end);
  } catch {
    return "Error";
  }
  return `${format(start)} - ${format(end)}`;
};

const DisplayTimeStamp = ({ ts }) => {
  let d = parseISO(ts);
  return format(d);
};

export { DisplayTimeFrame, DisplayTimeStamp };
