import React from 'react';

import Layout from '../components/layout';
import SEO from '../components/seo';

import Error404 from '../components/404';

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <Error404 />
  </Layout>
);

export default NotFoundPage;
