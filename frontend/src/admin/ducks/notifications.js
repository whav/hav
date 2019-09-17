import uuid from "uuid/v4";

const ADD_NOTIFICATION = "ADD_NOTIFICATION";
const REMOVE_NOTFICATION = "REMOVE_NOTIFICATION";

const reducer = (state = [], action) => {
  const { type, ...payload } = action;
  switch (type) {
    case ADD_NOTIFICATION:
      return [
        ...state,
        {
          id: uuid(),
          ...payload
        }
      ];
    case REMOVE_NOTFICATION:
      const id = payload.id;
      return state.filter(a => a.id !== id);
    default:
      return state;
  }
};

const add_notification = (message, level = "info", timeout = 2000) => ({
  type: ADD_NOTIFICATION,
  message,
  timeout,
  level
});

const remove_notification = id => ({
  type: REMOVE_NOTFICATION,
  id
});

export default reducer;
export { add_notification, remove_notification };
