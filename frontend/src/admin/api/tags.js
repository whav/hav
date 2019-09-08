import { autocompleteURL } from "./urls";
import { getCSRFCookie } from "../../utils/xhr";

const fetchTags = async query => {
  const response = await fetch(
    `${autocompleteURL}?${new URLSearchParams({ search: query })}`,
    {
      method: "GET",
      credentials: "same-origin",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json"
      })
    }
  );

  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    return Promise.reject(data);
  }
};

const createTag = async name => {
  const response = await fetch(autocompleteURL, {
    method: "POST",
    body: JSON.stringify({
      name
    }),
    headers: new Headers({
      "X-CSRFTOKEN": getCSRFCookie(),
      Accept: "application/json",
      "Content-Type": "application/json"
    }),
    credentials: "same-origin"
  });
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    return Promise.reject(data);
  }
};

export { fetchTags, createTag };
