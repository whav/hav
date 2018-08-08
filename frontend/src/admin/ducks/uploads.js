import uploadFile from "../api/upload";

export const UPLOAD_STARTED = "UPLOAD_STARTED";
export const UPLOAD_FAILED = "UPLOAD_FAILED";
export const UPLOAD_COMPLETED = "UPLOAD_COMPLETED";
export const UPLOAD_PROGRESS = "UPLOAD_PROGRESS";

/* REDUCERS */
const fileUpload = (state = {}, action) => {
  let { file, preview } = action;
  switch (action.type) {
    case UPLOAD_STARTED:
      return {
        name: file,
        failed: false,
        started: new Date(),
        progress: 0,
        preview: preview
      };
    case UPLOAD_PROGRESS:
      return {
        ...state,
        progress: action.progress
      };
    case UPLOAD_COMPLETED:
      return {
        ...state,
        progress: 100,
        finished: new Date()
      };
    case UPLOAD_FAILED:
      return {
        ...state,
        failed: true
      };
  }
};

const reducer = (state = {}, action) => {
  switch (action.type) {
    // redirect action to the actual
    // upload file instances
    case UPLOAD_STARTED:
    case UPLOAD_COMPLETED:
    case UPLOAD_FAILED:
    case UPLOAD_PROGRESS:
      const { key, file } = action;
      let currentPath = state[key] || {},
        currentFile = currentPath[file] || {};
      return {
        ...state,
        [key]: {
          ...currentPath,
          [file]: fileUpload(currentFile, action)
        }
      };
    default:
      return state;
  }
};

export const startFileUpload = (file, uploadTo) => {
  let default_args = {
    path: uploadTo,
    file: file.name,
    preview: file.preview
  };
  return dispatch => {
    dispatch({
      type: UPLOAD_STARTED,
      ...default_args
    });
    uploadFile(
      file,
      uploadTo,
      (response, status) => dispatch(upload_completed(default_args, response)),
      (progress = 0) => dispatch(upload_progress(default_args, progress)),
      (reason, status) => dispatch(upload_failed(default_args, reason, status)),
      false
    );
  };
};

export const upload_progress = (routeArgs, percent_complete) => {
  return {
    ...routeArgs,
    type: UPLOAD_PROGRESS,
    progress: percent_complete
  };
};

export const upload_failed = (routeArgs, reason, status) => {
  return {
    ...routeArgs,
    type: UPLOAD_FAILED,
    reason,
    status
  };
};

export const upload_completed = (routeArgs, payload) => {
  return {
    ...routeArgs,
    type: UPLOAD_COMPLETED,
    payload
  };
};

export const getUploadsForPath = (path, state) => {
  return [];
};

export default reducer;
