import { combineReducers } from "redux";

import uploads from "./uploads";
import repositories from "./browser";
import ingest from "./ingest";
import settings from "./settings";
import notifications from "./notifications";

const reducer = combineReducers({
  uploads,
  repositories,
  ingest,
  settings,
  notifications
});

export default reducer;
