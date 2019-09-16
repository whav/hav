import React from "react";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import { buildFrontendUrl } from "../../api/urls";
import BreadCrumbs from "../../ui/components/breadcrumbs";

const DirectoryListingBreadcrumbs = ({ dirs, activeIndex }) => {
  let items = dirs.map((d, index) => {
    return (
      <Link key={index} to={d.link || "#"}>
        {d.name}
      </Link>
    );
  });
  return <BreadCrumbs items={items} activeIndex={activeIndex} />;
};

const BreadCrumbsContainer = connect(
  (state, { directory = null, directories = [], match }) => {
    let activeIndex;
    if (directory.parents && directory.url) {
      directories = [...directory.parents, directory.url];
    }

    const dirs = directories.map((d, i) => {
      const link = buildFrontendUrl(d);
      if (link == match.url) {
        activeIndex = i;
      }
      return {
        ...state.repositories[d],
        link
      };
    });
    return {
      dirs,
      activeIndex
    };
  }
)(DirectoryListingBreadcrumbs);

export default withRouter(BreadCrumbsContainer);
