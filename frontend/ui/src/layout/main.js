/** @jsx jsx */
import { jsx } from "theme-ui";
import PropTypes from "prop-types";
import React from "react";

const Main = ({
  header = null,
  footer = null,
  content_variant = "layout.content",
  children
}) => (
  <div
    sx={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflowY: "auto"
    }}
  >
    <header
      sx={{
        variant: "layout.header"
      }}
    >
      {header}
    </header>
    <main
      sx={{
        variant: content_variant
      }}
    >
      {children}
    </main>
    <footer
      sx={{
        variant: "layout.footer"
      }}
    >
      {footer}
    </footer>
  </div>
);

Main.propTypes = {
  children: PropTypes.element.isRequired,
  header: PropTypes.element,
  footer: PropTypes.element
};

const StickyHeaderMain = props => {
  return <Main {...props} content_variant="layout.content_sticky" />;
};

export default Main;
export { StickyHeaderMain };
