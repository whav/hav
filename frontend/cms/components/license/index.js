import React from "react";
import Image from "next/image";

const License = (props) => {
  const { shortName, name, href, logo } = props;
  let license = <span title={name}>{shortName}</span>;

  if (href) {
    license = (
      <a className="underline" href={href}>
        {license}
      </a>
    );
  }
  return license;
};

export default License;
