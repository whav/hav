import { combineReducers } from "redux";
import {
  INGEST_TO,
  LOADING_INGESTION_DATA,
  SAVE_INGESTION_DATA_ERROR,
  SAVE_INGESTION_DATA_SUCCESS,
  RECEIVE_INITIAL_INGESTION_DATA,
  UPDATE_INGESTION_DATA,
  QUEUE_FOR_INGESTION,
  CLEAR_INGESTION_QUEUE,
  INGESTION_QUEUE_LOADED,
  INGESTION_QUEUES_LOADED,
  LOADING_SUCCESS,
  RECEIVE_INGEST_OPTIONS,
  INGESTION_SUCCESS
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
    default:
      return state;
  }
};

const ingest = combineReducers({
  loading,
  entries,
  options,
  queue,
  ingestTo,
  ingestionQueues
});

export default ingest;
