import { combineReducers } from 'redux'
import {
    QUEUE_CREATE,
    QUEUE_CREATED,
    QUEUE_CREATE_FAILED,
    SET_INGEST_TO
} from '../actions/ingest'

const queuesByName = (state={}, action) => {
    return state;
}

const ingestTo = (state=null, action) => {
    if (action.type === SET_INGEST_TO) {
        return action.path
    }
    return state
}

const ingest = combineReducers({
    queuesByName,
    ingestTo
})

export default ingest

