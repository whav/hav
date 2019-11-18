const parse = require("./daterange").default;

test("year is parsed correctly", () => {
  expect(parse("2008")).toEqual([
    "2008-01-01T00:00:00.000",
    "2009-01-01T00:00:00.000"
  ]);
});

test("year-month is parsed correctly", () => {
  expect(parse("2008-01")).toEqual([
    "2008-01-01T00:00:00.000",
    "2008-02-01T00:00:00.000"
  ]);
});

test("year-month is parsed correctly", () => {
  expect(parse("2008-01-12")).toEqual([
    "2008-01-12T00:00:00.000",
    "2008-01-13T00:00:00.000"
  ]);
});

test("date+hour is parsed correctly", () => {
  expect(parse("2008-01-12T14")).toEqual([
    "2008-01-12T14:00:00.000",
    "2008-01-12T15:00:00.000"
  ]);
});

test("date+hour+minutes is parsed correctly", () => {
  expect(parse("2008-01-12T14:32")).toEqual([
    "2008-01-12T14:32:00.000",
    "2008-01-12T14:33:00.000"
  ]);
});

test("date+hour+minutes+seconds is parsed correctly", () => {
  expect(parse("2008-01-12T14:32:15")).toEqual([
    "2008-01-12T14:32:15.000",
    "2008-01-12T14:32:16.000"
  ]);
});

test("Full iso without timezone", () => {
  expect(parse("2019-02-25T20:29:09.527")).toEqual([
    "2019-02-25T20:29:09.527",
    "2019-02-25T20:29:09.527"
  ]);
});
