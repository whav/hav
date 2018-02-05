import uuid4 from "uuid/v4";
import { history } from "../app";

import {
  fetchDataForIngestionForms,
  saveIngestionQueue,
  loadIngestQueueData,
  fetchAllIngestionQueues,
  fetchIngestOptions
} from "../api/ingest";

export const QUEUE_FOR_INGESTION = "QUEUE_FOR_INGESTION";
export const CLEAR_INGESTION_QUEUE = "CLEAR_INGESTION_QUEUE";

export const INGEST_TO = "SAVE_INGESTION_INTENT";

export const LOADING_INGESTION_DATA = "LOADING_INGESTION_DATA";
export const RECEIVE_INITIAL_INGESTION_DATA = "RECEIVE_INITIAL_INGEST_DATA";
export const UPDATE_INGESTION_DATA = "UPDATE_INGESTION_DATA";

export const SAVE_INGESTION_DATA_SUCCESS = "SAVE_INGESTION_DATA_SUCCESS";
export const SAVE_INGESTION_DATA_ERROR = "SAVE_INGESTION_DATA_ERROR";

// single ingestion queues
export const INGESTION_QUEUE_LOADED = "INGESTION_QUEUE_LOADED";
// all Ingestion queues
export const INGESTION_QUEUES_LOADED = "INGESTION_QUEUES_LOADED";

export const LOADING_SUCCESS = "LOADING_SUCCESS";
export const RECEIVE_INGEST_OPTIONS = "RECEIVE_INGEST_OPTIONS";

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
    fetchDataForIngestionForms(items, target).then(data => {
      dispatch({
        type: RECEIVE_INITIAL_INGESTION_DATA,
        data
      });
      dispatch({
        type: LOADING_SUCCESS
      });
    });
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

    saveIngestionQueue(data)
      .then(data => {
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

export const loadIngestOptions = () => {
  return dispatch => {
    fetchIngestOptions().then(data => {
      dispatch({
        type: RECEIVE_INGEST_OPTIONS,
        data: data
      });
    });
  };
};

export const fetchIngestionQueue = uuid => {
  return dispatch => {
    // set loading state
    dispatch({
      type: LOADING_INGESTION_DATA
    });
    loadIngestQueueData(uuid).then(data => {
      dispatch({
        type: INGESTION_QUEUE_LOADED,
        payload: data
      });
      dispatch({
        type: LOADING_SUCCESS
      });
    });
  };
};

export const loadAllIngestionQueues = () => {
  return dispatch => {
    dispatch({
      type: LOADING_INGESTION_DATA
    });
    fetchAllIngestionQueues().then(data => {
      dispatch({
        type: INGESTION_QUEUES_LOADED,
        payload: data
      });
      dispatch({
        type: LOADING_SUCCESS
      });
    });
  };
};
