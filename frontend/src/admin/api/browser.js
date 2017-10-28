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
  console.warn(p, path, repository);
  if (path) {
    p = normalizePath(`${p}${path}/`);
  }
  console.log(p);
  return encodeURI(`${prefix}${p}`);
};

export const requestDirectory = url => {
  return fetch(url, {
    credentials: "same-origin"
  }).then(response => {
    return response.json();
  });
};

export const createDirectory = (name, url) => {
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
