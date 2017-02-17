/**
 * Created by sean on 08/02/17.
 */
export const UPLOAD_STARTED = 'UPLOAD_STARTED'
export const UPLOAD_FAILED = 'UPLOAD_FAILED'
export const UPLOAD_COMPLETED = 'UPLOAD_COMPLETED'
export const UPLOAD_PROGRESS = 'UPLOAD_PROGRESS'

import uuid from 'uuid'
import uploadFile from '../api/upload'

export const upload_started = (repository, path, file, uploadTo) => {
    return (dispatch) => {
        let id = uuid()
        dispatch({type: UPLOAD_STARTED, id: id, file: file.name, repository, path});
        let default_args = [repository, path, file.name, id];
        uploadFile(
            file,
            uploadTo,
            (response, status) => dispatch(upload_completed(...default_args, response, status)),
            (progress=0) => dispatch(upload_progress(...default_args, progress)),
            (reason, status) => dispatch(upload_failed(...default_args, reason, status)),
            false
        );
    }
}

export const upload_progress = (repository, path, file, id, percent_complete) => {
    return {
        type: UPLOAD_PROGRESS,
        id,
        repository,
        file,
        path,
        progress: percent_complete
    }
}

export const upload_failed = (repository, path, file, id, reason, status) => {
    return {
        type: UPLOAD_FAILED,
        id,
        file,
        repository,
        path,
        reason,
        status
    }
}

export const upload_completed = (repository, path, file, id, response, status) => {
    return {
        type: UPLOAD_COMPLETED,
        id,
        file,
        repository,
        path,
        response
    }
}
