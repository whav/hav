// This component is used for .mdx? files outside of the `src/pages/` directory
// Some manual work is needed to get mdx working here
import React, { Component } from 'react';
import { graphql } from 'gatsby';

import { MDXRenderer } from 'gatsby-plugin-mdx';
import Layout from './layout';

export default class MDXRuntime extends Component {
  render() {
    const { children, data, ...props } = this.props;
    const { collection_slug, collection } = props.pageContext;
    return (
      <Layout active_collection={collection_slug} collection={collection}>
        <MDXRenderer {...props}>{data.mdx.body}</MDXRenderer>
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
