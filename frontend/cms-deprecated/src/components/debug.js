import React from 'react';
import Layout from './layout';
import { Router } from '@reach/router';

const Pre = props => <pre>{JSON.stringify(props, null, 2)}</pre>;
const DummyRoute = props => (
  <div>
    <h1>Default Route</h1>
    <Pre {...props} />
  </div>
);

const MediaStuff = props => (
  <div>
    <h1>Detail Route</h1>
    <Pre {...props} />
  </div>
);

const DebugPage = props => {
  return (
    <Layout>
      <Router>
        <DummyRoute default />
        <MediaStuff path=":collectionSlug/m/:mediaID/" />
      </Router>
    </Layout>
  );
};

export default DebugPage;
