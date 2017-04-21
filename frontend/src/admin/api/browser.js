/**
 * Created by sean on 09/02/17.
 */
export const requestDirectory = (url) => {
        return fetch(url, {
            credentials: 'same-origin',
        }).then(
            (response) => response.json()
        )
}

export const saveFileSelection = (fileIDs) => {
    return new Promise((resolve, reject) => { window.setTimeout(() => resolve(fileIDs)) }, 4000)
}
