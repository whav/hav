import { prepareIngestion, ingest as ingestionEndpoint } from "./urls";
import { getCSRFCookie } from "../../utils/xhr";

export const fetchDataForIngestionForms = (items, target) => {
  const body = { items, target };
  return fetch(prepareIngestion, {
    method: "POST",
    body: JSON.stringify(body),
    headers: new Headers({
      "X-CSRFTOKEN": getCSRFCookie(),
      Accept: "application/json",
      "Content-Type": "application/json"
    }),
    credentials: "same-origin"
  }).then(response => response.json());
};

export const ingest = data => {
  return fetch(ingestionEndpoint, {
    method: "POST",
    body: JSON.stringify(data),
    headers: new Headers({
      "X-CSRFTOKEN": getCSRFCookie(),
      Accept: "application/json",
      "Content-Type": "application/json"
    }),
    credentials: "same-origin"
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      return response.json().then(err => {
        return Promise.reject(err);
      });
    }
  });
};
