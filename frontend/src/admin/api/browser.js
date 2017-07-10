/**
 * Created by sean on 09/02/17.
 */
import { saveFilesForIngestion, browser } from "./urls";
import { getCSRFCookie } from "../../utils/xhr";

export const requestDirectory = (url = browser) => {
  return fetch(url, {
    credentials: "same-origin"
  }).then(response => {
    return response.json();
  });
};

export const createDirectory = (name, url = browser) => {
  console.log("name?", name);
  return fetch(url, {
    credentials: "same-origin",
    method: "POST",
    body: JSON.stringify({
      name
    }),
    headers: new Headers({
      "X-CSRFTOKEN": getCSRFCookie(),
      Accept: "application/json",
      "Content-Type": "application/json"
    })
  }).then(response => {
    return response.json();
  });
};
