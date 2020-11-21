/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "theme-ui";
import React from "react";

const Nav = ({ children }) => {
  return (
    <nav
      sx={{
        px: ".6rem",
      }}
    >
      <ul
        sx={{
          listStyle: "none",
          px: 0,
          "& a": {
            textDecoration: "none",
            color: "text",
            display: "block",
          },
          "li a:hover": {
            bg: "sidebar_hover",
          },
          "> li": {
            display: "block",
          },
        }}
      >
        {React.Children.map(children, (child, index) => (
          <li key={index}>{child}</li>
        ))}
      </ul>
    </nav>
  );
};

const NavGroup = ({ label, children }) => {
  return (
    <React.Fragment>
      {label}
      <ul
        sx={{
          listStyle: "none",
          px: "1rem",
        }}
      >
        {React.Children.map(children, (child, index) => (
          <li key={index}>{child}</li>
        ))}
      </ul>
    </React.Fragment>
  );
};

export { Nav, NavGroup };
