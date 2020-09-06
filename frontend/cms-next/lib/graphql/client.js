const gql = require("graphql-tag");
const ApolloClient = require("apollo-client").ApolloClient;
const fetch = require("node-fetch");
const createHttpLink = require("apollo-link-http").createHttpLink;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;

const httpLink = createHttpLink({
  uri: "https://hav2.aussereurop.univie.ac.at/api/graphql",
  fetch: fetch,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const query = async (query) => {
  const result = await client.query({ query: gql(query) });
  return result;
};

export { query, client };
