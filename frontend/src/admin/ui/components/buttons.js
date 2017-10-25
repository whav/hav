import React from "react";
import classnames from "classnames";

const Button = ({ className = "", ...props }) => {
  return <button className={classnames(className, "button")} {...props} />;
};

export default Button;
