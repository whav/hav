import React from "react";
import classnames from "classnames";

const Breadcrumbs = ({ items = [], activeIndex = -1 }) => {
  return (
    <nav className="breadcrumb" aria-label="breadcrumbs">
      <ul>
        {items.map((item, index) => (
          <li
            className={classnames({ "is-active": index === activeIndex })}
            key={index}
          >
            {item}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
