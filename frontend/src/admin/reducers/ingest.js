import { combineReducers } from "redux";
import {
  SET_INGEST_TO,
  LOADING_INGESTION_DATA,
  SAVE_INGESTION_DATA_ERROR,
  SAVE_INGESTION_DATA_SUCCESS,
  RECEIVE_INITIAL_INGESTION_DATA
} from "../actions/ingest";

const ingestTo = (state = null, action) => {
  if (action.type === SET_INGEST_TO) {
    return action.path;
  }
  return state;
};

const loading = (state = false, action) => {
  return action.type === LOADING_INGESTION_DATA;
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
    default:
      return state;
  }
};

const ingest = combineReducers({
  ingestTo,
  loading,
  entries
});

export default ingest;
