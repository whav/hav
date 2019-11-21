import {
  prepareIngestion,
  ingest as ingestionEndpoint,
  ingestQueueDetail,
  ingestOptions,
  ingestFileEndpoint,
  ingestQueueModifierEndpoint
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

export const removeItemFromQueue = (uuid, item) => {
  return fetch(ingestQueueModifierEndpoint(uuid, item), {
    method: "DELETE",
    body: JSON.stringify({
      items: [item]
    }),
    headers: new Headers({
      "X-CSRFTOKEN": getCSRFCookie(),
      Accept: "application/json",
      "Content-Type": "application/json"
    }),
    credentials: "same-origin"
  }).then(response => response.json());
};

export const saveIngestionQueue = data => {
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
  }).then(response => {
    return response
      .json()
      .then(json => (response.ok ? json : Promise.reject(json)));
  });
};
