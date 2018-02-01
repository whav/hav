import { DateTime } from "luxon";

// this regex's pattern count matches the resolutions below
const ISO_8601 = /^\d{4}(-\d\d(-\d\d(T\d\d(:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?)?$/i;

const resolutions = [
  "year",
  "month",
  "day",
  "hour",
  "minute",
  "second",
  "millisecond"
];

const parseDateToRange = date_string => {
  let m = date_string.match(ISO_8601);
  if (m === null) {
    throw "invalid date";
  }

  let partial_matches = Object.keys(m)
    .filter(k => Number.isInteger(parseInt(k, 10)))
    .map(i => m[i])
    .filter(x => x !== undefined);

  const resolution = resolutions[partial_matches.length - 1];

  console.warn(`specifity for ${partial_matches[0]} is ${resolution}`);

  const dt = DateTime.fromISO(date_string);

  if (dt.invalid) {
    throw dt.invalidReason || dt.invalid;
  }

  return [dt, dt.endOf(resolution)];
};

export default parseDateToRange;
