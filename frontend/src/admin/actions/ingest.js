import { fetchDataForIngestionForms, ingest } from "../api/ingest";

export const SET_INGEST_TO = "SET_INGEST_TO";

export const LOADING_INGESTION_DATA = "LOADING_INGESTION_DATA";
export const RECEIVE_INITIAL_INGESTION_DATA = "RECEIVE_INITIAL_INGEST_DATA";
export const UPDATE_INGESTION_DATA = "UPDATE_INGESTION_DATA";

export const SAVE_INGESTION_DATA_SUCCESS = "SAVE_INGESTION_DATA_SUCCESS";
export const SAVE_INGESTION_DATA_ERROR = "SAVE_INGESTION_DATA_ERROR";

export const ingestTo = havPath => {
  return {
    type: SET_INGEST_TO,
    path: havPath
  };
};

export const fetchInitialData = (files, target) => {
  return dispatch => {
    dispatch({
      type: LOADING_INGESTION_DATA
    });
    fetchDataForIngestionForms(files, target).then(data =>
      dispatch({
        type: RECEIVE_INITIAL_INGESTION_DATA,
        data
      })
    );
  };
};

export const saveIngestionData = (target, entries) => {
  return dispatch => {
    dispatch({
      type: LOADING_INGESTION_DATA
    });
    const data = {
      target,
      entries
    };
    ingest(data)
      .then(data => {
        dispatch({
          type: SAVE_INGESTION_DATA_SUCCESS,
          data
        });
      })
      .catch(errors => {
        dispatch({
          type: SAVE_INGESTION_DATA_ERROR,
          errors
        });
      });
  };
};

export const updateIngestionData = (ingestion_id, data) => {
  return {
    type: UPDATE_INGESTION_DATA,
    key: ingestion_id,
    data
  };
};
