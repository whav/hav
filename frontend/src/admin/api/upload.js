/**
 * Created by sean on 08/02/17.
 */
import {getCSRFCookie} from '../../utils/xhr'

import {file_upload} from './urls'

let defaultAction = () => {
    console.warn('File Uploader default action called with arguments:', arguments);
}

let calculateProgress = (progressEvent) => {
    if (progressEvent.lengthComputable) {
        return (progressEvent.loaded / progressEvent.total) * 100;
    }
    return 0;
}

const uploadFile = (file,
                    path,
                    onSuccess=defaultAction,
                    onProgress=defaultAction,
                    onFailure=defaultAction,
                    setFilenameHeaders=false
    ) => {

    let url = `${file_upload}/${path}/${file.name}`
    let csrftoken = getCSRFCookie();
    let request = new XMLHttpRequest();
    request.open('PUT', url, true);
    request.responseType = 'json';
    if (setFilenameHeaders) {
        request.setRequestHeader(
            'Content-Disposition',
            `attachment; filename=${file.name}`
        )
    }

    request.setRequestHeader("X-CSRFToken", csrftoken);
    request.withCredentials = true;

    // attach event handlers
    request.upload.addEventListener('progress', (e) => onProgress(calculateProgress(e)));
    request.addEventListener('error', () => onFailure(request.response, request.status));
    request.addEventListener('abort', () => onFailure({'detail': 'Request aborted.'}, 0));

    request.addEventListener('load', (e) => {
        console.log(request.response, request);
        let resp = request.response,
            status = request.status;
        console.log(resp, status);
        if (request.status === 201) {
            onSuccess(resp, status)
        } else {
            onFailure(resp, status)
        }
    });

    request.send(file);
}

export default uploadFile