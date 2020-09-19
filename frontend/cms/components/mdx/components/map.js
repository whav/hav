import React, { Suspense } from "react";
import styles from "./map.module.css";

const Map = React.lazy(() => import("./_map.js"));

const HAVMap = (props) => {
  if (typeof window === "undefined") {
    return null;
  } else {
    return (
      <div className={styles.map}>
        <Suspense fallback={<span />}>
          <Map {...props} />
        </Suspense>
      </div>
    );
  }
};

export default HAVMap;
