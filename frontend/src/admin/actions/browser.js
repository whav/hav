/**
 * Created by sean on 09/02/17.
 */
export const REQUEST_DIRECTORY = 'REQUEST_DIRECTORY'
export const RECEIVE_DIRECTORY_CONTENT = 'RECEIVE_DIRECTORY_CONTENT'
export const REFRESH_DIRECTORY_CONTENT = 'REFRESH_DIRECTORY_CONTENT'
export const ADD_FILE_TO_DIRECTORY = 'ADD_FILE_TO_DIRECTORY'
export const CHANGE_FILE_BROWSER_SETTINGS = 'CHANGE_FILE_BROWSER_SETTINGS'

import {requestDirectory} from '../api/browser'


export const addFile = (file, path) => {
    return {
        type: ADD_FILE_TO_DIRECTORY,
        file: file,
        path: path
    }
}

export const requestDirectoryAction = (path) => {
    return (dispatch) => {
        dispatch({
            type: REQUEST_DIRECTORY,
            path: path
        });
        requestDirectory(path).then((data) => {
            dispatch({
                type: RECEIVE_DIRECTORY_CONTENT,
                path,
                contents: data
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
