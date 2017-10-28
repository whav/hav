import React from "react";

import Level from "../components/level";
import Button from "../components/buttons";

const IngestionFooter = ({ clearQueue, ingestionIds }) => {
  const clearButton = (
    <Button className="is-danger" onClick={clearQueue}>
      Clear Queue
    </Button>
  );
  const ingestHereBtn = (
    <Button
      className="is-primary"
      onClick={() => {
        console.log(ingestionIds);
      }}
    >
      Ingest here
    </Button>
  );
  return <Level left={clearButton} right={ingestHereBtn} />;
};

export default IngestionFooter;
