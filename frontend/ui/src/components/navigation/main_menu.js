/** @jsx jsx */
import { jsx } from "theme-ui";
import React from "react";

const MainMenu = ({ children }) => {
  return (
    <nav
      sx={{
        px: ".5rem"
      }}
    >
      <ul
        sx={{
          listStyle: "none",
          px: 0,
          "& a": {
            textDecoration: "none",
            color: "text"
          }
        }}
      >
        {React.Children.map(children, (child, index) => (
          <li key={index}>{child}</li>
        ))}
      </ul>
    </nav>
  );
};

const MenuGroup = ({ label, children }) => {
  return (
    <React.Fragment>
      {label}
      <ul
        sx={{
          listStyle: "none",
          px: "1rem"
        }}
      >
        {React.Children.map(children, (child, index) => (
          <li key={index}>{child}</li>
        ))}
      </ul>
    </React.Fragment>
  );
};

export default {
  MainMenu,
  MenuGroup
};
