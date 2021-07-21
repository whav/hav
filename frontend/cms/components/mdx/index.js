import Map from "./components/map";
import Media from "./components/media";
import Folder from "./components/folder";
import Gallery from "./components/gallery";

import Wrapper from "./Wrapper";

const MDX = ({ children }) => <Wrapper>{children}</Wrapper>;

export default MDX;

const components = {
  HAVMap: (props) => <Map {...props} />,
  HAVMedia: (props) => <Media {...props} />,
  HAVFolder: (props) => <Folder {...props} />,
  Media: (props) => <Media {...props} />,
  Gallery: (props) => <Gallery {...props} />,
};

export { components };
