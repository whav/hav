import React from "react";
import { connect } from "react-redux";
import { buildFrontendUrl } from "../../api/urls";

import { DirectoryListingBreadcrumbs } from "../../ui/filebrowser";

const BreadCrumbs = connect((state, { directory = null, directories = [] }) => {
  if (directory) {
    directories = directory.parents;
  }
  return {
    dirs: directories.map(d => ({
      ...state.repositories[d],
      link: buildFrontendUrl(d)
    }))
  };
})(DirectoryListingBreadcrumbs);

export default BreadCrumbs;
