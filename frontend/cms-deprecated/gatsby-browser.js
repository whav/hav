/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it
import React from 'react';
import { ApolloProvider } from './src/apollo/provider';
import wrapWithProvider from './src/state/provider';

export const wrapPageElement = ({ element }) => {
  return <ApolloProvider>{wrapWithProvider(element)}</ApolloProvider>;
};
