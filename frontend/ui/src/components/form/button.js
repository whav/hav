import React from "react";

import { Button } from "rebass";

export default props => {
  console.log("Rendering button...", props);
  return <Button>{props.title || "Button"}</Button>;
};
