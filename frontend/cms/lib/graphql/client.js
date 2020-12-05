const { gql, GraphQLClient } = require("graphql-request");

const url = new URL("/d/api/graphql/", process.env.HAV_URL);

const client = new GraphQLClient(url.href, { headers: {} });

const query = async (query, variables) => {
  return client.request(query, variables);
};

export { query, client, gql, url };
