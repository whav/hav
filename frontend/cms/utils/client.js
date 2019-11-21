import 'cross-fetch/polyfill';

import ApolloClient from 'apollo-boost';

const uri = process.env.GRAPHQL_URI || `${process.env.HAV_URL}/api/graphql`;

const client = new ApolloClient({
  uri,
});

console.log(uri);

module.exports = client;
