import ApolloClient from 'apollo-boost';
import fetch from 'isomorphic-fetch';

export const buildClient = (uri = '') => {
  uri = `${uri}/api/graphql`;
  return new ApolloClient({
    uri,
    fetch,
  });
};
