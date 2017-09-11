import { prepareIngestion } from "./urls";
import { getCSRFCookie } from "../../utils/xhr";

export const fetchDataForIngestionForms = (files, target) => {
  const body = { files, target };
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
