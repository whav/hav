/**
 * Created by sean on 01/02/17.
 */
import React from "react";
import cn from "classnames";
import { SpinnerIcon } from "./icons";

import "./loading.css";

const LoadingIndicator = ({ className = "", rotating = false }) => {
  return (
    <SpinnerIcon
      className={cn("icon", { "spinning-ckw": rotating }, className)}
    />
  );
};

const LoadingPage = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <LoadingIndicator className="spinning-ckw" />
    </div>
  );
};

export default LoadingIndicator;
export { LoadingPage };
