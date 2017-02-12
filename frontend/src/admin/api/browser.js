/**
 * Created by sean on 09/02/17.
 */
import {browser} from './urls'

export const requestDirectory = (path) => {
        let url = path ? `${browser}/${path}/` : `${browser}/`;
        return fetch(url, {
            credentials: 'same-origin',
        }).then(
            (response) => response.json()
        )
}