const resolve = require("./routes").default;
const b = p => `https://hav.univie.ac.at/api/v1/${p}`;

test("repository root", () => {
  expect(resolve({ repository: "hav" })).toEqual(b("hav/"));
});

test("another repository root", () => {
  expect(resolve({ repository: "urxn" })).toEqual(b("sources/urxn/"));
});

test("respository and path", () => {
  expect(resolve({ repository: "hav", path: 123 })).toEqual(b("hav/123/"));
});

test("respository and complex path", () => {
  expect(resolve({ repository: "hav", path: "1/2/3" })).toEqual(
    b("hav/1/2/3/")
  );
});

test("respository and media", () => {
  expect(resolve({ repository: "hav", media_id: 123 })).toEqual(
    b("hav/media/123/")
  );
});
