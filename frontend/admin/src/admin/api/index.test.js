import API from "./index";
const api = new API("/api/");

test("deal with multiple slashes", () => {
  expect(api.build_url("/abcd/123/")).toBe("/api/abcd/123/");
});
