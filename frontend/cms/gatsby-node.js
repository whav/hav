// /**
//  * Implement Gatsby's Node APIs in this file.
//  *
//  * See: https://www.gatsbyjs.org/docs/node-apis/
//  */
const { createFilePath } = require('gatsby-source-filesystem');
const path = require('path');

// this matches relative paths to collections via slug
const collection_regex = new RegExp(/^([\w-]+)\/.*$/);

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;

  if (node.internal.type === 'Mdx') {
    // this gets the previous node, which is the one returned by
    // gatsby-source-filesystem
    const parentNode = getNode(node.parent);
    const slug = createFilePath({ node, getNode });
    createNodeField({
      node,
      name: `slug`,
      value: `/${parentNode.sourceInstanceName}${slug}`,
    });

    // set a default ordering from frontmatter
    createNodeField({
      node,
      name: 'ordering',
      value: `${node.frontmatter.ordering || ''}`,
    });

    createNodeField({
      node,
      name: 'sourceName',
      value: parentNode.sourceInstanceName,
    });

    // add the collection slug
    if (parentNode.sourceInstanceName === 'collections') {
      const collection_slug = parentNode.relativePath.match(
        collection_regex
      )[1];
      createNodeField({
        node,
        name: 'collection_slug',
        value: collection_slug,
      });
    }
  }
};

const buildCollectionPages = (collection, createPage) => {
  if (collection.browseable) {
    const browseURL = `/collections/${collection.slug}/browse/`;
    createPage({
      path: browseURL,
      matchPath: `${browseURL}*`,
      component: path.resolve('src/collection_pages/browse.js'),
      context: {
        collection,
        collection_slug: collection.slug,
        baseURL: browseURL,
      },
    });
  }

  if (collection.searchable) {
    const searchURL = `/collections/${collection.slug}/search/`;
    createPage({
      path: searchURL,
      matchPath: `${searchURL}*`,
      component: path.resolve('src/collection_pages/search.js'),
      context: {
        collection,
        collection_slug: collection.slug,
        baseURL: searchURL,
      },
    });
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  let collections = await graphql(`
    {
      hav {
        collections {
          name
          shortName
          slug
          rootNode {
            id
          }
          browseable
          searchable
        }
      }
    }
  `).then(res => res.data.hav.collections);

  // and create the dynamic pages for each collection
  collections.forEach(c => buildCollectionPages(c, createPage));

  const collectionMdxPages = await graphql(
    `
      {
        allMdx {
          edges {
            node {
              id
              tableOfContents
              fields {
                slug
                ordering
              }
              frontmatter {
                title
                date
              }
              parent {
                ... on File {
                  absolutePath
                  relativePath
                  relativeDirectory
                  name
                  sourceInstanceName
                }
              }
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      console.error(result.errors); // eslint-disable-line no-console
      throw result.errors;
    }
    return result.data.allMdx.edges;
  });

  collectionMdxPages.forEach(({ node }) => {
    const [_, collection_slug] = node.parent.relativePath.match(
      collection_regex
    );
    const collection = collections.find(c => c.slug === collection_slug);
    if (!collection_slug || !collection) {
      console.warn(
        `unknown collection ${collection_slug}: ${node.parent.absolutePath}`
      );
    }
    createPage({
      path: node.fields.slug,
      component: path.resolve('./src/mdx-components/wrapper.js'),
      context: {
        absPath: node.parent.absolutePath,
        tableOfContents: node.tableOfContents,
        collection_slug,
        collection,
        id: node.id,
      },
    });
  });
};
