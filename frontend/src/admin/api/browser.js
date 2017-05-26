/**
 * Created by sean on 09/02/17.
 */
import {saveFilesForIngestion, browser} from './urls'
import {getCSRFCookie} from '../../utils/xhr'

export const requestDirectory = (url=browser) => {
        console.log('requesting directory', url);
        return fetch(url, {
            credentials: 'same-origin',
        }).then(
            (response) => response.json()
        )
}
