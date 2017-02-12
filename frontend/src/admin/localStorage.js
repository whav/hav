/**
 * Created by sean on 10/02/17.
 */


export const saveState = (key, state) => {
    try {
        const serializedState = JSON.stringify(state)
        localStorage.setItem(key, serializedState)
    } catch (err) {
        console.error("Error while persisting to localStorage", err);
    }
}

export const loadState = (key) => {
    try {
        const serializedState = localStorage.getItem(key)
        if (serializedState === null) {
            console.log(`No serialized state in localStorage available for "${key}"`)
            return undefined
        }
        return JSON.parse(serializedState);
    } catch (err) {
        console.error('Unable to load from localStorage. Error was: ', err)
        return undefined
    }
}