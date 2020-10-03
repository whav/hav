/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

import React from 'react';
import { ApolloProvider } from './src/apollo/provider';
import wrapWithProvider from './src/state/provider';

export const wrapPageElement = ({ element }) => (
  <ApolloProvider>{wrapWithProvider(element)}</ApolloProvider>
);
