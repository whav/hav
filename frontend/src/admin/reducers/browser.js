import { combineReducers } from 'redux'

import {RECEIVE_DIRECTORY_CONTENT, CHANGE_FILE_BROWSER_SETTINGS, SELECT_FILES, TOGGLE_FILES_SELECT} from '../actions/browser'
import {UPLOAD_COMPLETED} from '../actions/uploads'

import {fileListDisplayValues} from '../ui/filebrowser/index'

const stripSlashes = (path) => {
    if (path === undefined) { return ''; }
    // remove opening/trailing slashes
    while (path.startsWith('/')) { path = path.slice(1)}
    while (path.endsWith('/'))   { path = path.slice(0,-1)}
    return path
}

const emptyPaths = [undefined, '', '/']
const getStateKeyForPath = (pathOrObj) => {
    switch (typeof pathOrObj) {
        case 'string':
            return stripSlashes(pathOrObj)
        case 'object':
            let {repository, path} = pathOrObj;
            if (repository !== undefined) {
                let normRepo = stripSlashes(repository)
                if (emptyPaths.includes(path)) {
                    return normRepo;
                }
                return `${normRepo}/${stripSlashes(path)}`
            }
        default:
            throw Error('Cannot get path for ', pathOrObj)
    }
}

const getDirectoryForPath = (path, state) => {
    state.directoriesByPath[getStateKeyForPath(path)];
    return state.directoriesByPath[getStateKeyForPath(path)]
}

const getFilesForPath = (path, state) => {
    return state.filesByPath[getStateKeyForPath(path)]
}

export {getStateKeyForPath, getDirectoryForPath, getFilesForPath, stripSlashes}

const directoriesByPath = (state={}, action) => {

    switch (action.type) {

        case RECEIVE_DIRECTORY_CONTENT:
            let {path} = action;
            const ownKey = getStateKeyForPath(path);
            let {
                parentDirs,
                childrenDirs,
                ...own
            } = action.payload;

            // we don't want the files here
            delete own.files

            let updatedDirs = {}

            // create lists of paths for parents and children
            // populates updatedDirs as a side effect
            let parents = parentDirs.map((d) => {
                let key = getStateKeyForPath({...path, path: d.path})
                updatedDirs[key] = {...state[key], ...d}
                return key
            })

            let children = childrenDirs.map((d) => {
                    let key = getStateKeyForPath({...path, path: d.path})
                    updatedDirs[key] = {...state[key], ...d}
                    return key
            })

            // add the loaded directory to the updated directories
            updatedDirs[ownKey] = {
                ...own,
                lastLoaded: new Date(),
                parents,
                children
            }

            // and merge everything
            return {
                ...state,
                ...updatedDirs
            }
        default:
            return state

    }
}

const filesByPath = (state={}, action) => {
    const fileDefaults = {
        selected: false
    };
    switch (action.type) {
        case RECEIVE_DIRECTORY_CONTENT:
            const ownKey = getStateKeyForPath(action.path)
            let {
                files
            } = action.payload;
            // patch in defaults
            // this also means that previously selected state is reset ..
            // we might want to fix that but it matches current file managers
            files = files.map((f) => ({
                ...fileDefaults,
                ...f
            }))

            return {
                ...state,
                [ownKey]: files
            }
        case TOGGLE_FILES_SELECT:
            const key = getStateKeyForPath(action.path)
            let {deselectOthers=true, spanSelection=false} = action.modifiers;
            let range = false;
            let currentFiles = state[key];

            if (spanSelection) {
                let selectedFiles = currentFiles.filter((f) => f.selected).sort((a, b) => a - b).reverse();
                if (selectedFiles.length === 0) {
                    spanSelection = false;
                } else {
                    let previouslySelectedFile = selectedFiles[0];
                    // grab the index of the previously selected file the file array
                    let previouslySelectedIndex = currentFiles.indexOf(previouslySelectedFile);
                    // and the index of the file that is now being selected
                    // we simply assume its being selected
                    let selectingFileIndex = currentFiles.findIndex((f) => f.name === action.files[0])
                    range = [previouslySelectedIndex, selectingFileIndex]
                    range.sort((a,b) => a-b)
                }
            }

            let updatedFiles = currentFiles.map((f, index) => {

                if (spanSelection && range && (range[0] <= index) && (index <= range[1])) {
                    return {
                        ...f,
                        selected: new Date()
                    }
                } else if (action.files.includes(f.name)) {
                    return {
                        ...f,
                        selected: f.selected  ? false : new Date()
                    }
                } else if (deselectOthers && f.selected) {
                    return {
                        ...f,
                        selected: false
                    }
                }
                return f;
            })
            return {
                ...state,
                [key]: updatedFiles
            }
        case UPLOAD_COMPLETED:
            // just append the new file to the existing ones
            let existingFiles = state[key]
            return {
                ...state,
                [key]: [
                    ...existingFiles,
                    action.response
                ]
            }
        default:
            return state
    }
}


// this is being used to hold global filebrowser settings
const settings = (
    state={
        selectedDisplayType: fileListDisplayValues[0],
        availableDisplayTypes: fileListDisplayValues
    },
    action) => {
    switch (action.type) {
        case CHANGE_FILE_BROWSER_SETTINGS:
            return {
                ...state,
                ...action.payload
            }
        default:
            return state
    }
}



const fileBrowsers = combineReducers({
    settings,
    directoriesByPath,
    filesByPath
})


export default fileBrowsers
