import { history } from "../app";
import { combineReducers } from "redux";

import { RECEIVE_MULTIPLE_FILE_INFO, RECEIVE_FILE_INFO } from "./browser";

import {
  fetchDataForIngestionForms,
  saveIngestionQueue,
  loadIngestQueueData,
  fetchAllIngestionQueues,
  fetchIngestOptions,
  removeItemFromQueue
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

export const INGESTION_SUCCESS = "INGESTION_SUCCESS";

export const LOADING_SUCCESS = "LOADING_SUCCESS";
export const RECEIVE_INGEST_OPTIONS = "RECEIVE_INGEST_OPTIONS";

const queue = (state = [], action) => {
  switch (action.type) {
    case QUEUE_FOR_INGESTION:
      return action.ingestionIds;
    case CLEAR_INGESTION_QUEUE:
      return [];
    default:
      return state;
  }
};

const ingestToUrl = (state = "/hav/", action) => {
  if (action.type === INGEST_TO) {
    return history.location.pathname;
  }
  return state;
};

const ingestTo = (state = null, action) => {
  switch (action.type) {
    case INGEST_TO:
      return action.target;
    case SAVE_INGESTION_DATA_ERROR:
      const { entries, ...errors } = action.errors;
      return state;
    default:
      return state;
  }
};

const loading = (state = true, action) => {
  switch (action.type) {
    case LOADING_INGESTION_DATA:
      return true;
    case RECEIVE_INITIAL_INGESTION_DATA:
    case SAVE_INGESTION_DATA_ERROR:
    case LOADING_SUCCESS:
      return false;
    default:
      return state;
  }
};

const entries = (state = [], action) => {
  switch (action.type) {
    case RECEIVE_INITIAL_INGESTION_DATA:
      return action.data.items.map(item => ({
        ingestion_id: item.item,
        path: item.path || [],
        data: {
          ...(item.initial_data || {})
        }
      }));
    case SAVE_INGESTION_DATA_ERROR:
      const errors = action.errors["entries"];
      return state.map((entry, index) => {
        return {
          ...entry,
          errors: errors[index]
        };
      });
    case UPDATE_INGESTION_DATA:
      const { key, data } = action;
      const index = state.findIndex(entry => key === entry.ingestion_id);
      const ps = state[index];
      return [
        ...state.slice(0, index),
        {
          ...ps,
          data: {
            ...ps.data,
            ...action.data
          }
        },
        ...state.slice(index + 1)
      ];
    default:
      return state;
  }
};

const options = (state = {}, action) => {
  switch (action.type) {
    case RECEIVE_INITIAL_INGESTION_DATA:
      return action.data.options;
    case RECEIVE_INGEST_OPTIONS:
      return action.data;
    default:
      return state;
  }
};

const ingestionQueues = (state = {}, action) => {
  switch (action.type) {
    case INGESTION_QUEUE_LOADED:
      return {
        ...state,
        [action.payload.uuid]: {
          ...action.payload,
          loaded: new Date()
        }
      };
    case INGESTION_QUEUES_LOADED:
      let queues = {};
      action.payload.forEach(queue => {
        queues[queue.uuid] = queue;
      });
      return queues;
    case INGESTION_SUCCESS:
      const { uuid, source_id, payload } = action;

      return {
        ...state,
        [uuid]: {
          ...state[uuid],
          ingestion_queue: state[uuid].ingestion_queue.filter(
            s => s !== source_id
          ),
          created_media_entries: [
            payload,
            ...(state[uuid].created_media_entries || [])
          ]
        }
      };
    default:
      return state;
  }
};

const reducer = combineReducers({
  loading,
  entries,
  options,
  queue,
  ingestTo,
  ingestToUrl,
  ingestionQueues
});

const cleanData = data => {
  let d = {};
  Object.keys(data).forEach(key => (data[key] ? (d[key] = data[key]) : null));
  return d;
};

export const queueForIngestion = ingestionIds => {
  return (dispatch, getState) => {
    dispatch({
      type: QUEUE_FOR_INGESTION,
      ingestionIds
    });
    const url = getState().ingest.ingestToUrl || "/hav/";
    history.push(url);
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

export const saveIngestionData = (target, entries, name) => {
  return dispatch => {
    dispatch({
      type: LOADING_INGESTION_DATA
    });
    const data = {
      target,
      selection: entries,
      name
    };

    saveIngestionQueue(data)
      .then(data => {
        dispatch({
          type: SAVE_INGESTION_DATA_SUCCESS,
          data
        });
        // clear the queue
        dispatch(clearIngestionQueue());
        // and redirect to the newly created queue
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

export const ingestionSuccess = (uuid, source_id, data) => {
  return {
    type: INGESTION_SUCCESS,
    uuid,
    source_id,
    payload: data
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
      // update the main file browser store
      dispatch({
        type: RECEIVE_MULTIPLE_FILE_INFO,
        payload: data.created_media_entries
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

export const deleteIngestItem = (uuid, source) => {
  return dispatch => {
    removeItemFromQueue(uuid, source).then(() =>
      dispatch(fetchIngestionQueue(uuid))
    );
  };
};

export const handleIngestUpdate = (uuid, data) => {
  return {
    type: RECEIVE_FILE_INFO,
    payload: data
  };
};

export default reducer;
