import React from "react";
import { connect } from "react-redux";

import { clearIngestionQueue } from "../../actions/ingest";
import FileBrowser from "./index";
import IngestionFooter from "../../ui/ingest/footer";

const HAVFileBrowser = ({ ingestionIds, clearIngestionQueue, ...props }) => {
  const hasQueue = ingestionIds.length > 0;
  const footer = hasQueue ? (
    <IngestionFooter
      clearQueue={clearIngestionQueue}
      ingestionIds={ingestionIds}
    />
  ) : null;
  return <FileBrowser {...props} footer={footer} />;
};

export default connect(
  state => {
    return {
      ingestionIds: state.ingest.queue
    };
  },
  {
    clearIngestionQueue
  }
)(HAVFileBrowser);
