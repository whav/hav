import { autocompleteURL } from "./urls";
import { getCSRFCookie } from "../../utils/xhr";

const fetchTags = async (query, collection) => {
  let params = {
    search: query || "",
    collection: collection || ""
  };
  const response = await fetch(
    `${autocompleteURL}?${new URLSearchParams(params)}`,
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

const createTag = async (name, collection) => {
  console.log(name, collection);
  const response = await fetch(autocompleteURL, {
    method: "POST",
    body: JSON.stringify({
      name,
      collection
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
