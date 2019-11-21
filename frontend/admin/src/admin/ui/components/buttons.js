import React from "react";
import classnames from "classnames";

const Button = ({ className = "", primary = false, ...props }) => {
  return (
    <button
      className={classnames("button", { "is-primary": primary }, className)}
      {...props}
    />
  );
};

const ButtonGroup = ({ children, alignRight = false }) => {
  return (
    <div className={classnames("buttons", { "is-right": alignRight })}>
      {children}
    </div>
  );
};

export default Button;
export { ButtonGroup };
