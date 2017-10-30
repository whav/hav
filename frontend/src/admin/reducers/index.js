/**
 * Created by sean on 07/02/17.
 */
import { combineReducers } from "redux";
import uploads from "./uploads";
import repositories from "./browser";
import ingest from "./ingest";
import { buildAPIUrl } from "../api/browser";

const reducers = {
  uploads,
  repositories,
  ingest
};

export default reducers;

// export default combineReducers(reducers);

export const getRepositoryDataFromState = (state, repository, path = "") => {
  const key = buildAPIUrl(repository, path);
  return state.repositories.browser[key];
};
