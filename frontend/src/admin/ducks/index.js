import { combineReducers } from "redux";

import uploads from "./uploads";
import repositories from "./browser";
import ingest from "./ingest";
import settings from "./settings";

const reducer = combineReducers({
  uploads,
  repositories,
  ingest,
  settings
});

export default reducer;
