/** @jsx jsx */
import { jsx, Box } from "theme-ui";

const MDX = ({ children }) => <>{children}</>;

export default MDX;

const Component = ({ title }) => (
  <Box p={4} color="white" bg="primary">
    <h1>{title}!</h1>
  </Box>
);

const components = {
  HAVMap: () => <Component title="Map" />,
  HAVMedia: () => <Component title="HAVMedia" />,
  Media: () => <Component title="Media" />,
};

export { components };
