// This component is used as a default for all .mdx? files
// inside the `src/pages/` directory
import React from 'react';
import Layout from '../components/layout';

import Media from './components/media';
import HAVMap from './components/map';

import { ThemeProvider } from 'hav-ui';
import { Components as uiComponents } from 'hav-ui';

const Components = {
  Media,
  HAVMap,
  ...uiComponents,
};

const MDXLayout = ({ children, ...props }) => (
  <ThemeProvider components={Components}>
    <Layout contentClass="static-content" {...props}>
      {children}
    </Layout>
  </ThemeProvider>
);

export default MDXLayout;
