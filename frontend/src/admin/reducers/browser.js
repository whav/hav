import { combineReducers } from 'redux'

import {RECEIVE_DIRECTORY_CONTENT} from '../actions/browser'
import {UPLOAD_COMPLETED} from '../actions/uploads'

import {ROOT_PATH_KEY} from '../store'

const getStateKeyForPath = (path) => {
    switch (path) {
        case '':
        case '/':
        case undefined:
            return ROOT_PATH_KEY
        default:
            // remove opening/trailing slashes
            while (path.startsWith('/') || path.endsWith('/')) {
                if (path.startsWith('/')) { path = path.slice(1)}
                if (path.endsWith('/')) { path = path.slice(0, -1)}
            }
            return path
    }
}


const directories = (state={}, action) => {
    switch (action.type) {

        case RECEIVE_DIRECTORY_CONTENT:
            let {
                parentDirs,
                childrenDirs,
                files,
                ...own
            } = action.contents;
            let ownKey = getStateKeyForPath(action.path)
            let updatedDirs = {}

            // create lists of paths for parents and children
            // populates updatedDirs as a side effect
            let parents = parentDirs.map((d) => {
                    let key = getStateKeyForPath(d.path)
                    updatedDirs[key] = {...state[key], ...d}
                    return key
            })

            let children = childrenDirs.map((d) => {
                    let key = getStateKeyForPath(d.path)
                    updatedDirs[key] = {...state[key], ...d}
                    return key
            })

            // add the loaded directory to
            updatedDirs[ownKey] = {
                ...own,
                lastLoaded: new Date(),
                parents,
                children
            }

            return {
                ...state,
                ...updatedDirs
            }

        default:
            return state

    }
}

const files = (state={}, action) => {
    let key = getStateKeyForPath(action.path)
    switch (action.type) {
        case RECEIVE_DIRECTORY_CONTENT:
            let {
                files
            } = action.contents;
            return {
                ...state,
                [key]: [...files]
            }
        case UPLOAD_COMPLETED:
            let existing_files = state[key] || []
            return {
                ...state,
                [key]: [
                    ...existing_files,
                    action.response
                ]
            }
        default:
            return state
    }
}



const filebrowser = combineReducers({
    directories,
    files,
})

export default filebrowser
export {getStateKeyForPath}