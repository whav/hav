import { combineReducers } from 'redux'

import {RECEIVE_DIRECTORY_CONTENT, CHANGE_FILE_BROWSER_SETTINGS, SELECT_FILES, TOGGLE_FILES_SELECT} from '../actions/browser'
import {UPLOAD_COMPLETED} from '../actions/uploads'

import {ROOT_PATH_KEY} from '../store'
import {fileListDisplayValues} from '../ui/filebrowser/index'

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
    let ownKey = getStateKeyForPath(action.path)
    switch (action.type) {
        case RECEIVE_DIRECTORY_CONTENT:
            let {
                parentDirs,
                childrenDirs,
                files,
                ...own
            } = action.payload;
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

const repositoryFiles = (state={}, action) => {
    const fileDefaults = {
        selected: false
    }
    let key = getStateKeyForPath(action.path)
    switch (action.type) {
        case RECEIVE_DIRECTORY_CONTENT:
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
                [key]: files
            }
        case TOGGLE_FILES_SELECT:
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

const repository = (state={
        directoriesByPath: {},
        filesByPath: {}
    }, action) => {
    if (Object.keys(action).includes('path')) {
        return {
            ...state,
            directoriesByPath: directories(state.directoriesByPath, action),
            filesByPath: repositoryFiles(state.filesByPath, action)
        }
    }
    return state;
}

// this switches between repositories
const repositoriesByID = (state={}, action) => {
    if (action.repository) {
        let repoName = action.repository
        let repoData = repository(state[repoName], action);
        return {
            ...state,
            [repoName]: repoData
        }
    }
    return state
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
    repositoriesByID
})

export {getStateKeyForPath}
export default fileBrowsers
