/**
 * Created by sean on 09/02/17.
 */
import { saveFilesForIngestion, browser, prefix } from "./urls";
import { getCSRFCookie } from "../../utils/xhr";

export const normalizePath = path => {
  return path.replace(/\/\//g, `/`);
};

export const buildAPIUrl = (repository, path = "") => {
  let p = `${repository}/`;
  if (path) {
    p = normalizePath(`${p}${path}/`);
  }
  return encodeURI(`${prefix}${p}`);
};

const directoryFetch = (url, method, data) => {
  return fetch(url, {
    credentials: "same-origin",
    method: method,
    body: JSON.stringify(data),
    headers: new Headers({
      "X-CSRFTOKEN": getCSRFCookie(),
      Accept: "application/json",
      "Content-Type": "application/json"
    })
  }).then(response => {
    if (!response.ok) {
      return response
        .json()
        .catch(() => {
          // Couldn't parse the JSON
          throw new Error(response.status);
        })
        .then(message => {
          // Got valid JSON with error response, use it
          return Promise.reject(message);
        });
    }
    // Successful response, parse the JSON and return the data
    return response.json();
  });
};

export const requestDirectory = url => {
  return fetch(url, {
    credentials: "same-origin"
  }).then(response => {
    return response.json();
  });
};

export const createDirectory = (url, data) => {
  return directoryFetch(url, "POST", data);
};

export const updateDirectory = (url, data) => {
  return directoryFetch(url, "PUT", data);
};
