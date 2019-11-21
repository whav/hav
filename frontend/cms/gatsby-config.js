var proxy = require('http-proxy-middleware');

let HAV_URL = process.env.HAV_URL || 'https://hav.aussereurop.univie.ac.at/';
if (HAV_URL.endsWith('/')) {
  HAV_URL = HAV_URL.slice(0, -1);
}

module.exports = {
  siteMetadata: {
    title: `Himalaya Archive Vienna`,
    description: `A gatsby driven version of the HAV frontend`,
    author: `@mcallistersean`,
    havURL: HAV_URL,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'collections',
        path: `${__dirname}/src/collections/`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: ['.mdx', '.md'],
        defaultLayouts: {
          default: require.resolve('./src/mdx-components/layout.js'),
        },
      },
    },
    {
      resolve: 'gatsby-source-graphql',
      options: {
        // This type will contain remote schema Query type
        typeName: 'HAV',
        // This is field under which it's accessible
        fieldName: 'hav',
        // Url to query from
        url: `${HAV_URL}/api/graphql`,
        // refetchInterval: 10,
      },
    },
    // We are not using these plugins directly but
    // due to https://github.com/gatsbyjs/gatsby/issues/17124
    // they need to be included here
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
  ],
  developMiddleware: app => {
    app.use(
      ['/api', '/images', '/admin', '/dbadmin', '/static'],
      proxy({
        target: HAV_URL,
      })
    );
  },
};
