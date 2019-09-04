import { autocompleteURL } from "./urls";

const fetchTags = query => {
  return fetch(autocompleteURL, {
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

export default fetchTags;
