/**
 * Created by sean on 07/02/17.
 */

import { createStore, applyMiddleware, compose } from 'redux'
// import createLogger from 'redux-logger'
import thunkMiddleware from 'redux-thunk'
import throttle from 'lodash/throttle'
import rootReducer from './reducers'
import {loadState, saveState} from './localStorage'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const localStorageKey = 'havAdmin'

export const ROOT_PATH_KEY = '__ROOT__'


const store =  createStore(
        rootReducer,
        loadState(localStorageKey),
        composeEnhancers(
            applyMiddleware(
                thunkMiddleware,
            )
        )
);


const getFinishedUploads = (uploads) => {
    // only persist finished uploads to localStorage
    let finishedUploads = {}
    Object.entries(uploads).forEach(([path, filesStruct]) => {
        let newFS = {}
        Object.entries(filesStruct).forEach(
            ([fileName, fileInfo]) => {
                if (fileInfo.finished) {
                    newFS[fileName] = fileInfo
                }
            })
        if (Object.keys(newFS).length > 0) {
            finishedUploads[path] = newFS
        }
    })
    return finishedUploads;
}

// save some stuff to localStorage
store.subscribe(throttle(() => {
    let state = store.getState();
    let finishedUploads = getFinishedUploads(state.uploads);
    console.log('Writing uploads to local storage', finishedUploads, new Date());
    saveState(
        localStorageKey,
        {
            uploads: finishedUploads
        }
    )
}), 50000);

export default store;
