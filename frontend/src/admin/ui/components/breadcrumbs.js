import React from "react";

const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav className="breadcrumb" aria-label="breadcrumbs">
      <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
    </nav>
  );
};

export default Breadcrumbs;
