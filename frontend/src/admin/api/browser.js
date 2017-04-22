/**
 * Created by sean on 09/02/17.
 */
import {saveFilesForIngestion} from './urls'
import {getCSRFCookie} from '../../utils/xhr'

export const requestDirectory = (url) => {
        console.log('requesting directory', url);
        return fetch(url, {
            credentials: 'same-origin',
        }).then(
            (response) => response.json()
        )
}

export const saveFileSelection = (fileIDs, url=saveFilesForIngestion) => {
    console.log(fileIDs)
    return fetch(
        url,
        {
            method: 'POST',
            body: JSON.stringify(fileIDs),
            headers: new Headers({
                'X-CSRFTOKEN': getCSRFCookie(),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            credentials: 'same-origin',
        }
    ).then((response) => response.json())
}
