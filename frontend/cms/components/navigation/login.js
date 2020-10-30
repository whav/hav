import React from "react";
import { useAPI } from "hooks";

const Username = () => {
  const { data, error } = useAPI("/api/auth/user/");
  console.log(data, error);
  const username = data?.username || "Anonymous!";
  return <em>{username}</em>;
};

export default Username;
