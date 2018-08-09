import { fileListDisplayValues } from "../ui/filebrowser/index";

const CHANGE_FILE_BROWSER_SETTINGS = "CHANGE_FILE_BROWSER_SETTINGS";

/* REDUCERS */

// this is being used to hold global filebrowser settings
const reducer = (
  state = {
    selectedDisplayType: fileListDisplayValues[0],
    availableDisplayTypes: fileListDisplayValues,
    gallerySize: "20vw"
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

export const switchFilebrowserDisplayType = displayType => {
  return {
    type: CHANGE_FILE_BROWSER_SETTINGS,
    payload: {
      selectedDisplayType: displayType
    }
  };
};

export default reducer;
