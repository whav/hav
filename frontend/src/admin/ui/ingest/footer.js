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
  return (
    <div>
      <hr />
      <Level
        left={clearButton}
        right={ingestHereBtn}
        className="ingestion-footer"
      />
    </div>
  );
};

export default IngestionFooter;
