import React from "react";

const Breadcrumbs = ({ children, separator = "/" }) => {
  return (
    <ul>
      {children.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
      <style jsx>{`
        ul {
          list-style: none;
          padding-left: 0;
        }
        li {
          display: inline-block;
        }
        li:not(:first-child) {
          padding-left: 0.5rem;
        }
        li:not(:first-child)::before {
          content: "${separator} "
        }
      `}</style>
    </ul>
  );
};

export default Breadcrumbs;
