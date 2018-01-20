import uuid4 from "uuid/v4";
import { history } from "../app";

import { fetchDataForIngestionForms, ingest } from "../api/ingest";

export const QUEUE_FOR_INGESTION = "QUEUE_FOR_INGESTION";
export const CLEAR_INGESTION_QUEUE = "CLEAR_INGESTION_QUEUE";

export const INGEST_TO = "SAVE_INGESTION_INTENT";

export const LOADING_INGESTION_DATA = "LOADING_INGESTION_DATA";
export const RECEIVE_INITIAL_INGESTION_DATA = "RECEIVE_INITIAL_INGEST_DATA";
export const UPDATE_INGESTION_DATA = "UPDATE_INGESTION_DATA";

export const SAVE_INGESTION_DATA_SUCCESS = "SAVE_INGESTION_DATA_SUCCESS";
export const SAVE_INGESTION_DATA_ERROR = "SAVE_INGESTION_DATA_ERROR";

const cleanData = data => {
  let d = {};
  Object.keys(data).forEach(key => (data[key] ? (d[key] = data[key]) : null));
  return d;
};

export const queueForIngestion = ingestionIds => {
  return {
    type: QUEUE_FOR_INGESTION,
    ingestionIds
  };
};

export const clearIngestionQueue = () => {
  return {
    type: CLEAR_INGESTION_QUEUE
  };
};

export const saveIngestionIntent = ingestionTarget => {
  return {
    type: INGEST_TO,
    target: ingestionTarget
  };
};

export const fetchInitialData = (items, target) => {
  return dispatch => {
    dispatch({
      type: LOADING_INGESTION_DATA
    });
    fetchDataForIngestionForms(items, target).then(data =>
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
      selection: entries
    };

    ingest(data)
      .then(data => {
        console.warn(data);
        dispatch({
          type: SAVE_INGESTION_DATA_SUCCESS,
          data
        });
        history.push(`/ingest/${data.uuid}/`);
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
