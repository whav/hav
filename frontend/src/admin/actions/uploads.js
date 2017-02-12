/**
 * Created by sean on 08/02/17.
 */
export const UPLOAD_STARTED = 'UPLOAD_STARTED'
export const UPLOAD_FAILED = 'UPLOAD_FAILED'
export const UPLOAD_COMPLETED = 'UPLOAD_COMPLETED'
export const UPLOAD_PROGRESS = 'UPLOAD_PROGRESS'

import uuid from 'uuid'
import uploadFile from '../api/upload'

export const upload_started = (file, path) => {
    return (dispatch) => {
        let id = uuid()
        dispatch({type: UPLOAD_STARTED, id: id, file: file.name, path: path});
        uploadFile(
            file,
            path,
            (reason, status) => dispatch(upload_completed(id, file.name, path, reason, status)),
            (progress=0) => dispatch(upload_progress(id, file.name, path, progress)),
            (reason, status) => dispatch(upload_failed(id, file.name, path, reason, status)),
            false
        );
    }
}

export const upload_progress = (id, file, path, percent_complete) => {
    return {
        type: UPLOAD_PROGRESS,
        id,
        file,
        path,
        progress: percent_complete
    }
}

export const upload_failed = (id, file, path, reason, status) => {
    return {
        type: UPLOAD_FAILED,
        id,
        file,
        path,
        reason,
        status
    }
}

export const upload_completed = (id, file, path, response) => {
    return {
        type: UPLOAD_COMPLETED,
        id,
        file,
        path,
        response
    }
}