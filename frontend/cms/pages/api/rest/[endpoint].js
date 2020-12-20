const fetch = require("node-fetch");

export default async (req, res) => {
  const {
    query: { endpoint },
  } = req;
  const url = `${process.env.HAV_URL}d/api/public/${endpoint}`;
  const params = req.params || {};
  console.log(url, params);

  // Default options are marked with *
  const response = await fetch(url, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json(); // parses JSON response into native JavaScript objects
  console.log(data);
  res.status(200).json(data);
};
