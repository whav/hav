/** @jsx jsx */
import { jsx } from "theme-ui";
import React from "react";

const Breadcrumbs = ({ items, separator = "/" }) => {
  return (
    <ul
      sx={{
        "& li": {
          display: "inline"
        },
        "& li+li:before": {
          content: `"${separator}"`,
          px: ".5rem"
        }
      }}
    >
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
};

export default Breadcrumbs;
