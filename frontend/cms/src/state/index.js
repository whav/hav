import { createStore as reduxCreateStore } from 'redux';

const reducer = (state, action) => {
  return state;
};

const initialState = { isMenuOpen: true };

const globalWindow = typeof window !== 'undefined' && window;

/* eslint-disable no-underscore-dangle */
const createStore = () =>
  reduxCreateStore(
    reducer,
    initialState,
    globalWindow && window.__REDUX_DEVTOOLS_EXTENSION__
      ? window.__REDUX_DEVTOOLS_EXTENSION__()
      : f => f
  );
/* eslint-enable */

export default createStore;
