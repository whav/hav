export const SET_INGEST_TO = "SET_INGEST_TO";

export const ingestTo = havPath => {
  return {
    type: SET_INGEST_TO,
    path: havPath
  };
};
