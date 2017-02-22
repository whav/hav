/**
 * Created by sean on 08/02/17.
 */
export const UPLOAD_STARTED = 'UPLOAD_STARTED'
export const UPLOAD_FAILED = 'UPLOAD_FAILED'
export const UPLOAD_COMPLETED = 'UPLOAD_COMPLETED'
export const UPLOAD_PROGRESS = 'UPLOAD_PROGRESS'

import uploadFile from '../api/upload'

export const upload_started = (path, file, uploadTo) => {
    let default_args = {
        path,
        file: file.name,
        preview: file.preview
    };
    console.log(default_args);
    return (dispatch) => {
        dispatch({
            type: UPLOAD_STARTED,
            ...default_args
        });
        uploadFile(
            file,
            uploadTo,
            (response, status) => dispatch(upload_completed(default_args, response)),
            (progress=0) => dispatch(upload_progress(default_args, progress)),
            (reason, status) => dispatch(upload_failed(default_args, reason, status)),
            false
        );
    }
}

export const upload_progress = (routeArgs, percent_complete) => {
    return {
        ...routeArgs,
        type: UPLOAD_PROGRESS,
        progress: percent_complete
    }
}

export const upload_failed = (routeArgs, reason, status) => {
    return {
        ...routeArgs,
        type: UPLOAD_FAILED,
        reason,
        status
    }
}

export const upload_completed = (routeArgs, payload) => {
    return {
        ...routeArgs,
        type: UPLOAD_COMPLETED,
        payload
    }
}
