/**
 * Created by sean on 08/02/17.
 */
import {
    UPLOAD_STARTED,
    UPLOAD_FAILED,
    UPLOAD_COMPLETED,
    UPLOAD_PROGRESS
} from '../actions/uploads'

import {getStateKeyForPath} from './browser'

const getUploadsForPath = (path, state) => {
    let key = getStateKeyForPath(path);
    return state[key] || []
}

const uploadFile = (state={}, action) => {
    let {file, preview} = action;
    switch (action.type) {
        case UPLOAD_STARTED:
            return {
                name: file,
                failed: false,
                started: new Date(),
                progress: 0,
                preview: preview
            }
        case UPLOAD_PROGRESS:
            return {
                ...state,
                progress: action.progress
            }
        case UPLOAD_COMPLETED:
            return {
                ...state,
                progress: 100,
                finished: new Date()
            }
        case UPLOAD_FAILED:
            return {
                ...state,
                failed: true,
            }

    }
}

const uploads = (state={}, action) => {

    switch (action.type) {
        // redirect action to the actual
        // upload file instances
        case UPLOAD_STARTED:
        case UPLOAD_COMPLETED:
        case UPLOAD_FAILED:
        case UPLOAD_PROGRESS:
            let key = getStateKeyForPath(action.path)
            let currentPath = state[key] || {},
                currentFile = currentPath[action.file] || {};
            return {
                ...state,
                [key]: {
                    ...currentPath,
                    [action.file]: uploadFile(
                        currentFile,
                        action
                    )
                }
            }
        default:
            return state
    }
}

export default uploads
export {getUploadsForPath}
