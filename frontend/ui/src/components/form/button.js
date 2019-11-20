import React from "react";

const Button = props => {
  console.log("Rendering button...", props);
  return <button>{props.title || "Button"}</button>;
};

export default Button;
