import {
  prepareIngestion,
  ingest as ingestionEndpoint,
  ingestQueueDetail,
  ingestOptions,
  ingestFileEndpoint
} from "./urls";
import { getCSRFCookie } from "../../utils/xhr";

export const fetchDataForIngestionForms = (items, target) => {
  const body = { selection: items, target };
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

export const loadIngestQueueData = uuid => {
  const url = ingestQueueDetail(uuid);
  return fetch(url, {
    method: "GET",
    credentials: "same-origin",
    headers: new Headers({
      "X-CSRFTOKEN": getCSRFCookie(),
      Accept: "application/json",
      "Content-Type": "application/json"
    })
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

export const fetchIngestOptions = () => {
  return fetch(ingestOptions, {
    method: "GET",
    credentials: "same-origin",
    headers: new Headers({
      "X-CSRFTOKEN": getCSRFCookie(),
      Accept: "application/json",
      "Content-Type": "application/json"
    })
  }).then(response => response.json());
};

export const fetchAllIngestionQueues = () => {
  return fetch(ingestionEndpoint, {
    method: "GET",
    credentials: "same-origin",
    headers: new Headers({
      "X-CSRFTOKEN": getCSRFCookie(),
      Accept: "application/json",
      "Content-Type": "application/json"
    })
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

export const queueForIngestion = (queue_id, data) => {
  return fetch(ingestFileEndpoint(queue_id), {
    method: "POST",
    body: JSON.stringify(data),
    headers: new Headers({
      "X-CSRFTOKEN": getCSRFCookie(),
      Accept: "application/json",
      "Content-Type": "application/json"
    }),
    credentials: "same-origin"
  }).then(response => response.json());
};
