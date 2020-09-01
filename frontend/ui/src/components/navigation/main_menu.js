/** @jsx jsx */
import { jsx } from "theme-ui";
import React from "react";

const Nav = ({ children }) => {
  return (
    <nav
      sx={{
        px: ".5rem",
      }}
    >
      <ul
        sx={{
          listStyle: "none",
          px: 0,
          "& a": {
            textDecoration: "none",
            color: "text",
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
