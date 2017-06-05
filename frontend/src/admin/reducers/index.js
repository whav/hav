/**
 * Created by sean on 07/02/17.
 */
import { combineReducers } from 'redux';
import uploads from './uploads'
import repositories from './browser'
import ingest from './ingest'

const reducers = {
    uploads,
    repositories,
    ingest
};

export default combineReducers(reducers);
