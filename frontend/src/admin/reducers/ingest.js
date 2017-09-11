import { combineReducers } from "redux";
import { SET_INGEST_TO } from "../actions/ingest";

const ingestTo = (state = null, action) => {
  if (action.type === SET_INGEST_TO) {
    return action.path;
  }
  return state;
};

const ingest = combineReducers({
  ingestTo
});

export default ingest;
