import React from "react";
import { connect } from "react-redux";

import { clearIngestionQueue, saveIngestionIntent } from "../../actions/ingest";
import FileBrowser from "./index";
import IngestionFooter from "../../ui/ingest/footer";

import resolvers from "./resolvers";

const HAVFileBrowser = ({
  hasQueue,
  ingestionIds,
  ingest,
  clearIngestionQueue,
  ingestTarget,
  ...props
}) => {
  const footer = hasQueue ? (
    <IngestionFooter
      clearQueue={clearIngestionQueue}
      ingestionIds={ingestionIds}
      ingestTarget={ingestTarget}
      ingest={() => ingest(ingestionIds)}
    />
  ) : null;
  return <FileBrowser {...props} footer={footer} />;
};

export default connect(
  (state, { match }) => {
    const ingestToKey = resolvers.resolveKeyFromMatch(match);
    const ingestTarget = state.repositories.browser[ingestToKey];
    return {
      hasQueue: state.ingest.queue.length > 0,
      ingestionIds: state.ingest.queue,
      ingestTarget
    };
  },
  (dispatch, { match, history }) => {
    const ingestToKey = resolvers.resolveKeyFromMatch(match);

    return {
      clearIngestionQueue: () => dispatch(clearIngestionQueue()),
      ingest: () => {
        dispatch(saveIngestionIntent(ingestToKey));
        history.push("/ingest/");
      }
    };
  }
)(HAVFileBrowser);
