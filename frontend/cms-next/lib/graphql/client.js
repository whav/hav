const { gql, GraphQLClient } = require("graphql-request");

// const url = new URL();
// url.origin = new URL(process.env.HAV_URL).origin;
// url.pathname = "/api/graphql/";

const client = new GraphQLClient(
  "https://hav2.aussereurop.univie.ac.at/api/graphql/",
  // url.href,
  { headers: {} }
);

const query = async (query, variables) => {
  const q = query;
  // console.log("url??", url, url.href);

  // console.log(q, variables);
  return client.request(q, variables);
};

export { query, client, gql };
