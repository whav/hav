import React from "react";
import Image from "next/image";

const License = (props) => {
  const { shortName, name, href, logo } = props;
  return (
    <div>
      {logo ? (
        <Image width={200} height={100} src={logo} title={name} />
      ) : (
        <span title={name}>{shortName}</span>
      )}
    </div>
  );
};

export default License;
