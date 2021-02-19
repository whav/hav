import Map from "./components/map";
import Media from "./components/media";
import Folder from "./components/folder";

import Wrapper from "./Wrapper";

const MDX = ({ children }) => <Wrapper>{children}</Wrapper>;

export default MDX;

const components = {
  HAVMap: (props) => <Map {...props} />,
  HAVMedia: (props) => <Media {...props} />,
  HAVFolder: (props) => <Folder {...props} />,
  Media: (props) => <Media {...props} />,
};

export { components };
