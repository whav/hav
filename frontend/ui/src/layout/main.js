/** @jsx jsx */
import { jsx } from "theme-ui";
import PropTypes from "prop-types";
import { Box as BaseBox } from "@theme-ui/components";

const Box = (props) => <BaseBox px={3} {...props} />;

const Main = ({
  header = null,
  footer = null,
  content_variant = "layout.content",
  children,
}) => (
  <div
    sx={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflowY: "auto",
    }}
  >
    <Box
      as="header"
      px={3}
      sx={{
        variant: "layout.header",
      }}
    >
      {header}
    </Box>
    <Box
      as="main"
      sx={{
        variant: content_variant,
      }}
    >
      {children}
    </Box>
    <Box
      as="footer"
      sx={{
        variant: "layout.footer",
      }}
    >
      {footer}
    </Box>
  </div>
);

Main.propTypes = {
  children: PropTypes.element.isRequired,
  header: PropTypes.element,
  footer: PropTypes.element,
};

const StickyHeaderMain = (props) => {
  return <Main {...props} content_variant="layout.content_sticky" />;
};

export default Main;
export { StickyHeaderMain };
