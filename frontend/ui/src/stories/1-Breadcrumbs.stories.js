import React from "react";

import BreadCrumbs from "../components/navigation/breadcrumbs";

export default {
  title: "Breadcrumbs"
};

const levels = ["Level A", "Level B", "Level C"];

export const simple = () => {
  return <BreadCrumbs items={levels} />;
};

export const withLinks = () => {
  const links = levels.map((label, index) => (
    <a key={index} href={`#${label}`}>
      {label}
    </a>
  ));
  return <BreadCrumbs items={links} />;
};
