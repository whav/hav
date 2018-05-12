/**
 * Created by sean on 07/02/17.
 */
import { combineReducers } from "redux";
import uploads from "./uploads";
import repositories from "./browser";
import ingest from "./ingest";
import { buildAPIUrl } from "../api/browser";

import resolvers from "../containers/filebrowser/resolvers";

const { resolveKey } = resolvers;

const reducers = {
  uploads,
  repositories,
  ingest
};

export default reducers;
