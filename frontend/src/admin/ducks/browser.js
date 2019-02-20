import { requestDirectory, createDirectory } from "../api/browser";
import { UPLOAD_COMPLETED } from "./uploads";

export const REQUEST_DIRECTORY = "REQUEST_DIRECTORY";
export const RECEIVE_DIRECTORY_CONTENT = "RECEIVE_DIRECTORY_CONTENT";
export const RECEIVE_FILE_INFO = "RECEIVE_FILE_INFO";
export const RECEIVE_MULTIPLE_FILE_INFO = "RECEIVE_MULTIPLE_FILE_INFO";
export const SELECT_ITEMS = "SELECT_ITEMS";

export const MKDIR = "MKDIR";
export const MKDIR_SUCCESS = "MKDIR_SUCCESS";
export const MKDIR_FAIL = "MKDIR_FAIL";

/* REDUCERS */

const reducer = (state = {}, action) => {
  switch (action.type) {
    case RECEIVE_DIRECTORY_CONTENT:
      let { files = [], childrenDirs = [], parentDirs = [] } = action.payload;
      let mapping = {};
      files.forEach(f => {
        const previous_data = state[f.url] || {};
        mapping[f.url] = {
          ...previous_data,
          isFile: true,
          isDirectory: false,
          ...f
        };
      });

      childrenDirs.forEach(directory => {
        mapping[directory.url] = {
          isFile: false,
          isDirectory: true,
          ...directory
        };
      });

      // grab the keys, because this is the directory contents
      const children_keys = Object.keys(mapping);

      parentDirs.forEach(directory => {
        mapping[directory.url] = {
          ...(state[directory.url] || {}),
          isFile: false,
          isDirectory: true,
          ...directory
        };
      });

      let ownData = {
        ...action.payload
      };

      const ownKey = ownData.url;
      const parents = parentDirs.map(d => d.url);

      const existingData = state[ownKey] || {};

      // remove duplicate information
      delete ownData.childrenDirs;
      delete ownData.files;
      delete ownData.parentDirs;

      mapping[ownKey] = {
        ...existingData,
        ...ownData,
        selected: existingData.selected || [],
        content: children_keys,
        parents,
        lastLoaded: new Date()
      };

      return {
        ...state,
        ...mapping
      };
    case SELECT_ITEMS:
      return {
        ...state,
        [action.container_id]: {
          ...state[action.container_id],
          selected: action.item_ids
        }
      };
    case RECEIVE_FILE_INFO:
      const data = action.payload;
      const previousState = state[data.url] || {};
      return {
        ...state,
        [data.url]: {
          ...previousState,
          isFile: true,
          isDirectory: false,
          ...data
        }
      };
    case RECEIVE_MULTIPLE_FILE_INFO:
      let new_state = {};
      action.payload.forEach(f => (new_state[f.url] = f));
      return {
        ...state,
        ...new_state
      };
    case UPLOAD_COMPLETED:
      const folder = state[action.key];
      const file_info = action.payload;
      return {
        ...state,
        [action.key]: {
          ...folder,
          content: [file_info.url, ...folder.content]
        },
        [file_info.url]: file_info
      };
    default:
      return state;
  }
};

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
    return requestDirectory(url).then(data => {
      dispatch({
        type: RECEIVE_FILE_INFO,
        payload: data
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

export const createDirectoryAction = (name, url) => {
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

export default reducer;
