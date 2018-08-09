/**
 * Created by sean on 01/02/17.
 */
import React from "react";

import { SpinnerIcon } from "./icons";

const LoadingIndicator = () => {
  return (
    <span className="icon is-large">
      <SpinnerIcon />
    </span>
  );
};

export default LoadingIndicator;
