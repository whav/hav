/**
 * Created by sean on 07/02/17.
 */
import { combineReducers } from 'redux';
import uploads from './uploads'
import repositories from './browser'


const reducers = {
    uploads,
    repositories
};

export default combineReducers(reducers);
