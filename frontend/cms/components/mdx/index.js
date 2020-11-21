/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Box } from "theme-ui";
import Map from "./components/map";
import Media from "./components/media";
import Wrapper from "./Wrapper";

const MDX = ({ children }) => <Wrapper>{children}</Wrapper>;

export default MDX;

const Component = ({ title }) => (
  <Box p={4} color="white" bg="primary">
    <h1>{title}!</h1>
  </Box>
);

const components = {
  HAVMap: (props) => <Map {...props} />,
  HAVMedia: (props) => <Media {...props} />,
  Media: (props) => <Media {...props} />,
};

export { components };
