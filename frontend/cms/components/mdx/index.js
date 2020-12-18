import Map from "./components/map";
import Media from "./components/media";
import Wrapper from "./Wrapper";

const MDX = ({ children }) => <Wrapper>{children}</Wrapper>;

export default MDX;

const components = {
  HAVMap: (props) => <Map {...props} />,
  HAVMedia: (props) => <Media {...props} />,
  Media: (props) => <Media {...props} />,
};

export { components };
