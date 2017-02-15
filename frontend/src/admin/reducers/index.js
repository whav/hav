/**
 * Created by sean on 07/02/17.
 */
import { combineReducers } from 'redux';
import uploads from './uploads'
import filebrowser from './browser'


const reducers = {
    uploads,
    filebrowser,
};

export default combineReducers(reducers);