import React from "react";
import Image from "next/image";

const icons = {
  "ccbyncsa4.0": "by-nc-sa.svg",
  "ccbysa4.0": "by-sa.svg",
  //  "by-nc-nd.svg",
  //   "by-nc.svg",
  //   "by-nd.svg",
  //   "by.svg",
  //   "cc-zero.svg",
  //   "publicdomain.svg",
};

const get_license_icon_by_slug = (slug) => {
  return icons[slug];
};

const License = (props) => {
  const { shortName, name, href } = props;
  const icon = `/license/${get_license_icon_by_slug(shortName)}`;
  return (
    <div>
      <Image src={icon} unsized={true} title={name} />
    </div>
  );
};

export default License;
