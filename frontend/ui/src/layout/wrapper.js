/** @jsx jsx */
import { jsx } from "theme-ui";
import PropTypes from "prop-types";

const Wrapper = props => (
  <div
    sx={{
      display: "flex",
      flexWrap: "wrap",
      height: "100vh",
      overflow: "hidden",
      variant: "layout.root"
    }}
  >
    <aside
      sx={{
        flexGrow: 1,
        flexBasis: "sidebar",
        variant: "layout.main_nav"
      }}
    >
      {props.nav}
    </aside>
    <main
      sx={{
        flexGrow: 99999,
        flexBasis: 0,
        minWidth: 320,
        height: "100%",
        overflowY: "hidden",
        variant: "layout.main"
      }}
    >
      {props.children}
    </main>
  </div>
);

Wrapper.propTypes = {
  nav: PropTypes.element,
  children: PropTypes.element.isRequired
};

export default Wrapper;
