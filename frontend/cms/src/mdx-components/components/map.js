import React, { Suspense } from 'react';

const Map = React.lazy(() => import('./_map.js'));

const HAVMap = props => {
  if (typeof window === 'undefined') {
    return null;
  } else {
    return (
      <Suspense fallback={<span />}>
        <Map {...props} />
      </Suspense>
    );
  }
};

export default HAVMap;
