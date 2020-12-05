import React from "react";
import { useAPI } from "hooks";

const Username = () => {
  const { data = {} } = useAPI(`/api/v1/auth/`);
  //   console.log(data);
  const { username = "" } = data;
  return username;
};

export { Username };
