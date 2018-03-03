/**
 * Created by sean on 09/02/17.
 */

export const REQUEST_DIRECTORY = "REQUEST_DIRECTORY";
export const RECEIVE_DIRECTORY_CONTENT = "RECEIVE_DIRECTORY_CONTENT";
export const RECEIVE_FILE_INFO = "RECEIVE_FILE_INFO";
export const CHANGE_FILE_BROWSER_SETTINGS = "CHANGE_FILE_BROWSER_SETTINGS";

export const SELECT_ITEMS = "SELECT_ITEMS";

export const MKDIR = "MKDIR";
export const MKDIR_SUCCESS = "MKDIR_SUCCESS";
export const MKDIR_FAIL = "MKDIR_FAIL";

import { requestDirectory, createDirectory } from "../api/browser";

export const requestDirectoryAction = url => {
  return dispatch => {
    dispatch({
      type: REQUEST_DIRECTORY,
      url
    });
    requestDirectory(url).then(data => {
      dispatch({
        type: RECEIVE_DIRECTORY_CONTENT,
        payload: data,
        url
      });
    });
  };
};

export const requestFile = url => {
  return dispatch => {
    requestDirectory(url).then(data => {
      dispatch({
        type: RECEIVE_FILE_INFO,
        payload: data
      });
    });
  };
};

export const switchFilebrowserDisplayType = displayType => {
  return {
    type: CHANGE_FILE_BROWSER_SETTINGS,
    payload: {
      selectedDisplayType: displayType
    }
  };
};

export const createDirectoryAction = (name, path, url) => {
  console.log(name, path, url);
  return dispatch => {
    dispatch({
      type: MKDIR,
      name
    });
    createDirectory(name, url)
      .then(data => {
        dispatch({
          type: MKDIR_SUCCESS
        });
        // request the same directory again
        dispatch(requestDirectoryAction(url));
      })
      .catch(err => {
        console.error(err);
        dispatch({
          type: MKDIR_FAIL
        });
      });
  };
};

export const selectItems = (container_id, items = []) => {
  return {
    type: SELECT_ITEMS,
    container_id,
    item_ids: items
  };
};
