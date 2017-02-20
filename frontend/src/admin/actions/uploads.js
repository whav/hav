/**
 * Created by sean on 08/02/17.
 */
export const UPLOAD_STARTED = 'UPLOAD_STARTED'
export const UPLOAD_FAILED = 'UPLOAD_FAILED'
export const UPLOAD_COMPLETED = 'UPLOAD_COMPLETED'
export const UPLOAD_PROGRESS = 'UPLOAD_PROGRESS'

import uploadFile from '../api/upload'

export const upload_started = (path, file, uploadTo) => {
    return (dispatch) => {
        dispatch({
            type: UPLOAD_STARTED,
            file: file.name,
            path
        });

        let default_args = [path, file.name];
        uploadFile(
            file,
            uploadTo,
            (response, status) => dispatch(upload_completed(...default_args, response)),
            (progress=0) => dispatch(upload_progress(...default_args, progress)),
            (reason, status) => dispatch(upload_failed(...default_args, reason, status)),
            false
        );
    }
}

export const upload_progress = (path, file, percent_complete) => {
    return {
        type: UPLOAD_PROGRESS,
        file,
        path,
        progress: percent_complete
    }
}

export const upload_failed = (path, file, reason, status) => {
    return {
        type: UPLOAD_FAILED,
        file,
        path,
        reason,
        status
    }
}

export const upload_completed = (path, file, payload) => {
    return {
        type: UPLOAD_COMPLETED,
        file,
        path,
        payload
    }
}
