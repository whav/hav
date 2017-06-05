import {fetchIngestionQueues, saveFileSelection} from '../api/ingest'

export const SAVING_INGEST_QUEUE = 'SAVING_INGEST_QUEUE'
export const SAVING_INGEST_QUEUE_FAILED = 'SAVING_INGEST_QUEUE_FAILED'
export const SAVING_INGEST_QUEUE_SUCCESS = 'SAVING_INGEST_QUEUE_SUCCESS'

export const SET_INGEST_TO = 'SET_INGEST_TO'

export const FETCHING_INGEST_QUEUES = 'FETCHING_INGEST_QUEUES'
export const FETCHING_INGEST_QUEUES_SUCCESS = 'FETCHING_INGEST_QUEUES_SUCCESS'

export const getIngestionQueues = () => {
    return (dispatch) => {
        dispatch({
            type: FETCHING_INGEST_QUEUES
        })
        fetchIngestionQueues()
            .then((data) => {
                dispatch({
                    type: FETCHING_INGEST_QUEUES_SUCCESS,
                    queues: data
                })
            })
    }
}

export const saveFileSelectionForIngestion = (files) => {
    return (dispatch) => {
        dispatch({
            type: SAVING_INGEST_QUEUE
        });
        saveFileSelection(files)
            .then((data) => {
                dispatch({
                    type: SAVING_INGEST_QUEUE_SUCCESS,
                    payload: data
                })
            })
            .catch((data) => {
                dispatch({
                    type: SAVING_INGEST_QUEUE_FAILED,
                    payload: data
                })
            })
    }
}

export const queueFilesForIngestion = (files) => {
    return {
        type: 'FILES!!!',
        payload: files
    }
}

export const ingestTo = (havPath) => {
    return {
        type: SET_INGEST_TO,
        path: havPath
    }
}