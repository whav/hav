/**
 * Created by sean on 07/02/17.
 */

import { createStore, applyMiddleware, compose } from "redux";
import thunkMiddleware from "redux-thunk";

import { persistStore, persistCombineReducers } from "redux-persist";
// import storage from "redux-persist/es/storage"; // default: localStorage if web, AsyncStorage if react-native
import storage from "redux-persist/lib/storage/session";
import rootReducers from "./reducers";

const config = {
  key: "root",
  storage,
  whitelist: ["ingest"]
};

const reducer = persistCombineReducers(config, rootReducers);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

function configureStore() {
  let store = createStore(
    reducer,
    composeEnhancers(applyMiddleware(thunkMiddleware))
  );
  let persistor = persistStore(store);

  return { persistor, store };
}

export const ROOT_PATH_KEY = "__ROOT__";

const getFinishedUploads = uploads => {
  // only persist finished uploads to localStorage
  let finishedUploads = {};
  Object.entries(uploads).forEach(([path, filesStruct]) => {
    let newFS = {};
    Object.entries(filesStruct).forEach(([fileName, fileInfo]) => {
      if (fileInfo.finished) {
        newFS[fileName] = fileInfo;
      }
    });
    if (Object.keys(newFS).length > 0) {
      finishedUploads[path] = newFS;
    }
  });
  return finishedUploads;
};

// const localStorageKey = 'havAdmin'
// import {loadState, saveState} from './localStorage'

// save some stuff to localStorage
// store.subscribe(throttle(() => {
//     let state = store.getState();
//     let finishedUploads = getFinishedUploads(state.uploads);
//     // console.log('Writing uploads to local storage', finishedUploads, new Date());
//     saveState(
//         localStorageKey,
//         {
//             uploads: finishedUploads
//         }
//     )
// }), 50000);

export default configureStore;
