/**
 * Created by sean on 01/02/17.
 */
import React from "react";

import { FaSpinner } from "react-icons/fa";

const LoadingIndicator = () => {
  return (
    <span className="icon is-large">
      <FaSpinner />
    </span>
  );
};

export default LoadingIndicator;
