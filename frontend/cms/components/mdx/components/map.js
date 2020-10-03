import React, { Suspense } from "react";
import { Card } from "theme-ui";

const Map = React.lazy(() => import("./_map.js"));

const HAVMap = (props) => {
  if (typeof window === "undefined") {
    return null;
  } else {
    return (
      <Card>
        <Suspense fallback={<span />}>
          <Map {...props} />
        </Suspense>
      </Card>
    );
  }
};

export default HAVMap;
