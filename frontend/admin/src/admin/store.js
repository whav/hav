/**
 * Created by sean on 07/02/17.
 */

import { createStore, applyMiddleware, compose } from "redux";
import thunkMiddleware from "redux-thunk";

import rootReducer from "./ducks/index";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const configureStore = () => {
  return createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunkMiddleware))
  );
};

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

export default configureStore;
