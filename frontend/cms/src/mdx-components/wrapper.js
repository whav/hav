// This component is used for .mdx? files outside of the `src/pages/` directory
// Some manual work is needed to get mdx working here
import React, { Component } from 'react';
import { graphql } from 'gatsby';

import Media from './components/media';
import HAVMap from './components/map';

import { MDXRenderer } from 'gatsby-plugin-mdx';
import { MDXProvider } from '@mdx-js/react';
import Layout from './layout';

const Components = {
  Media,
  HAVMap,
};

export default class MDXRuntime extends Component {
  render() {
    const { children, data, ...props } = this.props;
    const { collection_slug, collection } = props.pageContext;
    return (
      <Layout active_collection={collection_slug} collection={collection}>
        <MDXProvider components={Components}>
          <MDXRenderer {...props}>{data.mdx.body}</MDXRenderer>
        </MDXProvider>
      </Layout>
    );
  }
}

export const pageQuery = graphql`
  query MDXRuntimeQuery($id: String!) {
    mdx(id: { eq: $id }) {
      id
      body
      frontmatter {
        title
      }
    }
  }
`;
