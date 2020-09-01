/** @jsx jsx */
import { jsx } from "theme-ui";
import PropTypes from "prop-types";
import { Image } from "../components";

const Wrapper = (props) => {
  console.log(props);
  return (
    <div
      sx={{
        display: "flex",
        flexDirection: ["column", "row"],
        height: "100vh",
        overflow: "hidden",
        variant: "layout.root",
      }}
    >
      <aside
        sx={{
          flexGrow: 1,
          flexBasis: "sidebar",
          variant: "layout.main_nav",
        }}
      >
        {props.logo_url && (
          <Image
            src={logo_url}
            px={[1, 4]}
            py={[1, 4]}
            sx={{ maxWidth: [100, 300] }}
          />
        )}
        {props.nav}
      </aside>
      <main
        sx={{
          flexGrow: 99999,
          flexBasis: 0,
          minWidth: 320,
          height: "100%",
          overflowY: "hidden",
          variant: "layout.main",
        }}
      >
        {props.children}
      </main>
    </div>
  );
};

Wrapper.propTypes = {
  nav: PropTypes.element,
  logo_url: PropTypes.string,
  children: PropTypes.element.isRequired,
};

export default Wrapper;
