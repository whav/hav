import {saveFilesForIngestion} from './urls'
import {getCSRFCookie} from '../../utils/xhr'

export const fetchIngestionQueues = () => {
      return fetch(
        saveFilesForIngestion,
        {
            method: 'GET',
            headers: new Headers({
                'X-CSRFTOKEN': getCSRFCookie(),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            credentials: 'same-origin',
        }
    ).then((response) => response.json())
}

export const saveFileSelection = (files, description='', url=saveFilesForIngestion) => {
    let data = {
        source_references: files.map((f) => f.key),
        description
    }
    return fetch(
        url,
        {
            method: 'POST',
            body: JSON.stringify(data),
            headers: new Headers({
                'X-CSRFTOKEN': getCSRFCookie(),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            credentials: 'same-origin',
        }
    ).then((response) => response.json())
}
