import { combineReducers } from 'redux'
import {
    QUEUE_CREATE,
    QUEUE_CREATED,
    QUEUE_CREATE_FAILED
} from '../actions/ingest'

const queuesByName = (state={}, action) => {
    return state;
}


const ingest = combineReducers({
    queuesByName
})

export default ingest

