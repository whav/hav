import React from "react";

const Breadcrumbs = ({ children, separator = "/" }) => {
  return (
    <ul className="list-none">
      {React.Children.toArray(children).map((item, index) => (
        <li className="inline-block pr-2" key={index}>
          {index > 0 ? " / " : ""} {item}
        </li>
      ))}
    </ul>
  );
};

export default Breadcrumbs;
