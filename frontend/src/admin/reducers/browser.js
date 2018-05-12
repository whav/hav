import {
  RECEIVE_DIRECTORY_CONTENT,
  CHANGE_FILE_BROWSER_SETTINGS,
  SELECT_ITEMS,
  RECEIVE_FILE_INFO
} from "../actions/browser";

import { UPLOAD_COMPLETED } from "../actions/uploads";

import { fileListDisplayValues } from "../ui/filebrowser/index";
import { combineReducers } from "redux";

const normalize_url = url => {
  let key;
  try {
    key = new URL(url);
  } catch (e) {
    key = new URL(url, window.location.href);
  }
  return key;
};

const filesByUri = (state = {}, action) => {
  switch (action.type) {
    case RECEIVE_DIRECTORY_CONTENT:
      const attrs = {
        isFile: false,
        isDirectory: false
      };
      let { files = [], childrenDirs = [], parentDirs = [] } = action.payload;
      let mapping = {};
      files.forEach(f => {
        mapping[f.url] = {
          ...attrs,
          isFile: true,
          ...f
        };
      });

      childrenDirs.forEach(directory => {
        mapping[directory.url] = {
          ...attrs,
          isDirectory: true,
          ...directory
        };
      });

      // grab the keys, because this is the directory contents
      const children_keys = Object.keys(mapping);

      parentDirs.forEach(directory => {
        mapping[directory.url] = {
          ...(state[directory.url] || {}),
          ...attrs,
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
      return state;
    case RECEIVE_FILE_INFO:
      const data = action.payload;
      return {
        ...state,
        [data.url]: {
          isFile: true,
          isDirectory: false,
          ...data
        }
      };
    default:
      return state;
  }
};

// this is being used to hold global filebrowser settings
const settings = (
  state = {
    selectedDisplayType: fileListDisplayValues[0],
    availableDisplayTypes: fileListDisplayValues
  },
  action
) => {
  switch (action.type) {
    case CHANGE_FILE_BROWSER_SETTINGS:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};

const fileBrowsers = combineReducers({
  settings,
  browser: filesByUri
});

export default fileBrowsers;
