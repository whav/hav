/**
 * Created by sean on 09/02/17.
 */
export const REQUEST_DIRECTORY = 'REQUEST_DIRECTORY'
export const RECEIVE_DIRECTORY_CONTENT = 'RECEIVE_DIRECTORY_CONTENT'
export const CHANGE_FILE_BROWSER_SETTINGS = 'CHANGE_FILE_BROWSER_SETTINGS'
export const TOGGLE_FILES_SELECT = 'TOGGLE_FILES_SELECT'

import {requestDirectory} from '../api/browser'


export const toggleSelect = (repository, path, files, modifiers) => {
    return {
        type: TOGGLE_FILES_SELECT,
        repository,
        path,
        files,
        modifiers
    }
}

export const requestDirectoryAction = (url, repository, path) => {
    return (dispatch) => {
        dispatch({
            type: REQUEST_DIRECTORY,
            path,
            repository
        });
        requestDirectory(url).then((data) => {
            dispatch({
                type: RECEIVE_DIRECTORY_CONTENT,
                payload: data,
                path,
                repository
            })
        })
    }
}

export const switchFilebrowserDisplayType = (displayType) => {
    return {
        type: CHANGE_FILE_BROWSER_SETTINGS,
        payload: {
            selectedDisplayType: displayType
        }
    }
}


