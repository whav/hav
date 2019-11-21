import React from "react";
import cn from "classnames";

const ProgressBar = ({ progress, success, error }) => {
  return (
    <progress
      className={cn("progress", { "is-danger": error, "is-success": success })}
      value={progress}
      max="100"
    >
      {`${progress}%`}
    </progress>
  );
};

export default ProgressBar;
