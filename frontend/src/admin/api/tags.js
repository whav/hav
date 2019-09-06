import { autocompleteURL } from "./urls";

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
    // Fix me: this breaks pagination
    return data.results;
  } else {
    return Promise.reject(data);
  }
};

export default fetchTags;
