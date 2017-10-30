import React from "react";
import classnames from "classnames";

const Button = ({ className = "", ...props }) => {
  return <button className={classnames(className, "button")} {...props} />;
};

const ButtonGroup = ({ children }) => {
  return (
    <div className="field is-grouped">
      {children.map((c, i) => (
        <div key={i} className="control">
          {c}
        </div>
      ))}
    </div>
  );
};

export default Button;
export { ButtonGroup };
