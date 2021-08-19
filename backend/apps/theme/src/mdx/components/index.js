import React from 'react';

import Media from "./media";
import Folder from "./folder";
import Wrapper from "./Wrapper";

const components = {
  HAVMedia: (props) => <Media {...props} />,
  HAVFolder: (props) => <Folder {...props} />,
  Media: (props) => <Media {...props} />,
  wrapper: (props) => <Wrapper {...props} />
};

export { components };
