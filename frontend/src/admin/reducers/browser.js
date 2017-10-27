import { combineReducers } from "redux";

import {
  RECEIVE_DIRECTORY_CONTENT,
  CHANGE_FILE_BROWSER_SETTINGS,
  TOGGLE_FILES_SELECT,
  TOGGLE_FILES_SELECT_ALL,
  SELECT_ITEMS,
  MKDIR_SUCCESS
} from "../actions/browser";

import { UPLOAD_COMPLETED } from "../actions/uploads";

import { fileListDisplayValues } from "../ui/filebrowser/index";

const stripSlashes = path => {
  if (path === undefined) {
    return "";
  }
  if (typeof path != "string") {
    path = String(path);
  }
  // remove opening/trailing slashes
  while (path.startsWith("/")) {
    path = path.slice(1);
  }
  while (path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  return path;
};

const emptyPaths = [undefined, "", "/", null];
const getStateKeyForPath = pathOrObj => {
  switch (typeof pathOrObj) {
    case "string":
      return stripSlashes(pathOrObj);
    case "object":
      let { repository, path } = pathOrObj;
      if (repository !== undefined) {
        let normRepo = stripSlashes(repository);
        if (emptyPaths.includes(path)) {
          return normRepo;
        }
        return `${normRepo}/${stripSlashes(path)}`;
      }
    default:
      throw Error("Cannot get path for ", pathOrObj);
  }
};

const getDirectoryForPath = (path, state) => {
  state.directoriesByPath[getStateKeyForPath(path)];
  return state.directoriesByPath[getStateKeyForPath(path)];
};

const getFilesForPath = (path, state) => {
  return state.filesByPath[getStateKeyForPath(path)];
};

export {
  getStateKeyForPath,
  getDirectoryForPath,
  getFilesForPath,
  stripSlashes
};

const normalize_url = url => {
  let key;
  try {
    key = new URL(url);
  } catch (e) {
    key = new URL(url, window.location.href);
  }
  return key;
};

const directoriesByPath = (state = {}, action) => {
  switch (action.type) {
    case RECEIVE_DIRECTORY_CONTENT:
      let { path } = action;
      const ownKey = getStateKeyForPath(path);
      let { parentDirs, childrenDirs, ...own } = action.payload;

      own.files = own.files.map(f => f.url);

      let updatedDirs = {};

      // create lists of paths for parents and children
      // populates updatedDirs as a side effect
      let parents = parentDirs.map(d => {
        let key = getStateKeyForPath({ ...path, path: d.path });
        updatedDirs[key] = { ...state[key], ...d };
        return key;
      });

      let children = childrenDirs.map(d => {
        let key = getStateKeyForPath({ ...path, path: d.path });
        updatedDirs[key] = { ...state[key], ...d };
        return key;
      });

      // add the loaded directory to the updated directories
      updatedDirs[ownKey] = {
        ...own,
        lastLoaded: new Date(),
        parents,
        children
      };

      // and merge everything
      return {
        ...state,
        ...updatedDirs
      };
    case MKDIR_SUCCESS:
      const new_state = Object.keys(state)
        .filter(k => k != action.path)
        .reduce((s, k) => ({ ...s, k: state[k] }), {});
      return new_state;
    case TOGGLE_FILES_SELECT:
      if (action.path) {
        let key = getStateKeyForPath(action.path);
      }
      return state;
    default:
      return state;
  }
};

const filesByPath = (state = {}, action) => {
  let stateKey = undefined,
    existingFiles = [];
  if (action.path) {
    stateKey = getStateKeyForPath(action.path);
    existingFiles = state[stateKey] || [];
  }

  switch (action.type) {
    case RECEIVE_DIRECTORY_CONTENT:
      let { files } = action.payload;
      // patch in defaults
      // this also means that previously selected state is reset ..
      // we might want to fix that but it matches current file managers

      let existingFilesByName = {};
      existingFiles.forEach((f, i) => (existingFilesByName[f.name] = f));

      files = files.map(f => ({
        ...{ selected: false },
        ...(existingFilesByName[f.name] || {}),
        ...f
      }));

      return {
        ...state,
        [stateKey]: files
      };
    case TOGGLE_FILES_SELECT:
      let { deselectOthers = true, spanSelection = false } = action.modifiers;
      let range = false;
      if (spanSelection) {
        let selectedFiles = existingFiles
          .filter(f => f.selected)
          .sort((a, b) => a - b)
          .reverse();
        if (selectedFiles.length === 0) {
          spanSelection = false;
        } else {
          let previouslySelectedFile = selectedFiles[0];
          // grab the index of the previously selected file the file array
          let previouslySelectedIndex = existingFiles.indexOf(
            previouslySelectedFile
          );
          // and the index of the file that is now being selected
          // we simply assume its being selected
          let selectingFileIndex = existingFiles.findIndex(
            f => f.name === action.files[0]
          );
          range = [previouslySelectedIndex, selectingFileIndex];
          range.sort((a, b) => a - b);
        }
      }

      let updatedFiles = existingFiles.map((f, index) => {
        if (spanSelection && range && range[0] <= index && index <= range[1]) {
          return {
            ...f,
            selected: new Date()
          };
        } else if (action.files.includes(f.name)) {
          return {
            ...f,
            selected: f.selected ? false : new Date()
          };
        } else if (deselectOthers && f.selected) {
          return {
            ...f,
            selected: false
          };
        }
        return f;
      });
      return {
        ...state,
        [stateKey]: updatedFiles
      };
    case TOGGLE_FILES_SELECT_ALL:
      // undefined means toggle, true/false for select deselect
      let select = action.select
        ? true
        : action.select === false ? false : undefined;
      return {
        ...state,
        [stateKey]: existingFiles.map(f => ({
          ...f,
          selected: select === undefined ? !f.selected : select
        }))
      };
    case UPLOAD_COMPLETED:
      // just append the new file to the existing ones
      return {
        ...state,
        [stateKey]: [...existingFiles, action.payload]
      };
    default:
      return state;
  }
};

const filesByUri = (state = {}, action) => {
  switch (action.type) {
    case RECEIVE_DIRECTORY_CONTENT:
      const attrs = {
        isFile: false,
        isDirectory: false
      };
      let { files, childrenDirs, parentDirs } = action.payload;
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
          ...attrs,
          isDirectory: true,
          ...directory
        };
      });

      let ownData = {
        ...action.payload
      };

      const ownKey = ownData.url;
      const parents = ownData.parentDirs.map(d => d.url);

      // remove duplicate information
      delete ownData.childrenDirs;
      delete ownData.files;
      delete ownData.parentDirs;

      mapping[action.payload.url] = {
        ...ownData,
        selected: [],
        content: children_keys,
        parents,
        lastLoaded: new Date()
      };

      return {
        ...state,
        ...mapping
      };
    case SELECT_ITEMS:
      console.warn("SELECTING", action);
      return {
        ...state,
        [action.container_id]: {
          ...state[action.container_id],
          selected: action.item_ids
        }
      };
      return state;
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
  directoriesByPath,
  filesByPath,
  filesByUri
});

export default fileBrowsers;
