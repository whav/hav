import { fileListDisplayValues } from "../ui/filebrowser/index";

const CHANGE_FILE_BROWSER_SETTINGS = "CHANGE_FILE_BROWSER_SETTINGS";
const TOGGLE_GROUPED = "TOGGLE_GROUPED";

/* REDUCERS */

// this is being used to hold global filebrowser settings
const reducer = (
  state = {
    selectedDisplayType: fileListDisplayValues[0],
    availableDisplayTypes: fileListDisplayValues,
    gallerySize: "20vw",
    displayGrouped: false
  },
  action
) => {
  console.log(action);
  switch (action.type) {
    case CHANGE_FILE_BROWSER_SETTINGS:
      return {
        ...state,
        ...action.payload
      };
    case TOGGLE_GROUPED:
      return {
        ...state,
        displayGrouped: !state.displayGrouped
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

export const switchGrouped = () => {
  console.log("Switching...");
  return {
    type: TOGGLE_GROUPED
  };
};

export default reducer;
