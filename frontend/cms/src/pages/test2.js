import React from 'react';
import Media from '../mdx-components/components/media';
import Layout from '../components/layout';

const TestPage2 = props => {
  return (
    <Layout>
      <Media id={180} />
      <hr />
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </Layout>
  );
};

export default TestPage2;
