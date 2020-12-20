const fetch = require("node-fetch");
const { URL, URLSearchParams } = require("url");

export default async (req, res) => {
  const {
    query: { endpoint, search },
  } = req;
  const url = new URL(`/d/api/public/${endpoint}`, process.env.HAV_URL);

  url.search = new URLSearchParams({ query: search }).toString();

  // Default options are marked with *
  const response = await fetch(url, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  res.status(200).json(data);
};
