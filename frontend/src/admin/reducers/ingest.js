import { combineReducers } from "redux";
import {
  SET_INGEST_TO,
  LOADING_INGESTION_DATA,
  SAVE_INGESTION_DATA_ERROR,
  SAVE_INGESTION_DATA_SUCCESS,
  RECEIVE_INITIAL_INGESTION_DATA,
  UPDATE_INGESTION_DATA,
  QUEUE_FOR_INGESTION,
  CLEAR_INGESTION_QUEUE
} from "../actions/ingest";

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

const ingestTo = (state = null, action) => {
  if (action.type === SET_INGEST_TO) {
    return action.path;
  }
  return state;
};

const loading = (state = true, action) => {
  switch (action.type) {
    case LOADING_INGESTION_DATA:
      return true;
    case RECEIVE_INITIAL_INGESTION_DATA:
    case SAVE_INGESTION_DATA_ERROR:
    case SAVE_INGESTION_DATA_ERROR:
      return false;
    default:
      return state;
  }
};

const entries = (state = [], action) => {
  switch (action.type) {
    case RECEIVE_INITIAL_INGESTION_DATA:
      return action.data.files.map(f => ({
        ingestion_id: f.ingest_id,
        data: {
          ...f.initial_data
        }
      }));
    case SAVE_INGESTION_DATA_ERROR:
      console.warn("Ingestion errors", action);
      return state;
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

const options = (state = {}, action) =>
  action.type === RECEIVE_INITIAL_INGESTION_DATA ? action.data.options : state;

const ingest = combineReducers({
  ingestTo,
  loading,
  entries,
  options,
  queue
});

export default ingest;
