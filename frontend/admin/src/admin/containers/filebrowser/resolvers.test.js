import helpers from "./resolvers";

test("strip slashes correctly", () => {
  const strip = helpers.stripSlashes;
  expect(strip("/etc/pass/wd/")).toBe("etc/pass/wd");
  expect(strip("/////urxn/data//")).toBe("urxn/data");
  expect(strip("abcd")).toBe("abcd");
});

test("correctly concatenate repo and path", () => {
  const join = helpers.joinRepoAndPath;
  expect(join("source", "/a/b/c/")).toBe("source/a/b/c");
  expect(join("/source/", "/a/b/c/")).toBe("source/a/b/c");
  expect(join("source", "")).toBe("source");
  expect(join("source", null)).toBe("source");
  expect(join("source", undefined)).toBe("source");
});

test("get key from match", () => {
  const resolve = helpers.resolveKeyFromMatch;
  const mockedMatch = { params: { repository: "urxn", path: "a/b/c" } };
  expect(resolve(mockedMatch)).toBe(
    "https://hav.univie.ac.at/api/v1/urxn/a/b/c/"
  );
});
