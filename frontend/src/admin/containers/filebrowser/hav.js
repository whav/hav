import React from "react";
import { connect } from "react-redux";

import { clearIngestionQueue } from "../../actions/ingest";
import FileBrowser from "./index";
import IngestionFooter from "../../ui/ingest/footer";

const HAVFileBrowser = ({ ingestionIds, clear, ...props }) => {
  const hasQueue = ingestionIds.length > 0;
  console.warn(hasQueue);
  const footer = hasQueue ? (
    <IngestionFooter clear={clear} ingestionIds={ingestionIds} />
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
    clear: clearIngestionQueue
  }
)(HAVFileBrowser);
