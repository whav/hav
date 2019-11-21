import React from 'react';
import { ApolloProvider as RealApolloProvider } from 'react-apollo';
import { StaticQuery, graphql } from 'gatsby';
import { buildClient } from './client';

export const ApolloProvider = ({ children }) => {
  return (
    <StaticQuery
      query={graphql`
        query {
          site {
            siteMetadata {
              havURL
            }
          }
        }
      `}
      render={data => {
        console.log(data);
        return (
          <RealApolloProvider
            client={buildClient(data.site.siteMetadata.havURL)}
          >
            {children}
          </RealApolloProvider>
        );
      }}
    />
  );
};
