import React from "react";
import { useAPI } from "hooks";

const Username = () => {
  const { data = {} } = useAPI(`/api/v1/auth/`);
  const { username, login_url, logout_url } = data;
  if (username) {
    return <a href={logout_url}>{username}</a>;
  } else {
    return <a href={login_url}>Login</a>;
  }
};

export { Username };
