// This component is used as a default for all .mdx? files
// inside the `src/pages/` directory
import React from 'react';
import Layout from '../components/layout';

const MDXLayout = ({ children, ...props }) => (
  <Layout contentClass="static-content" {...props}>
    {children}
  </Layout>
);

export default MDXLayout;
