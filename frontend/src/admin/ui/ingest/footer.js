import React from "react";

import Level from "../components/level";
import Button from "../components/buttons";

const IngestionFooter = ({
  clearQueue,
  ingest,
  ingestionIds,
  ingestTarget
}) => {
  const clearButton = (
    <Button className="is-danger" onClick={clearQueue}>
      Clear Queue
    </Button>
  );
  const ingestHereBtn = (
    <Button className="is-primary" onClick={ingest}>
      Ingest {ingestTarget ? `to ${ingestTarget.name}.` : `here`}
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
