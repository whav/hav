import React, { Suspense } from "react";

const Map = React.lazy(() => import("./_map.js"));

const HAVMap = (props) => {
  if (typeof window === "undefined") {
    return null;
  } else {
    return (
      <div>
        <Suspense fallback={<span />}>
          <Map {...props} />
        </Suspense>
      </div>
    );
  }
};

export default HAVMap;
