import React from "react";
import { default as NextImage } from "next/image";

const getWebassetForType = (type, webassets = []) => {
  return webassets.find((wa) => type === wa.mimeType.split("/")[0]);
};

const Image = (props) => {
  let { url, title, height, width } = props;
  let dimensionProps = {
    unsized: true,
  };
  if (width && height) {
    const ratio = width / height;
    if (width > height) {
      width = 800;
    } else {
      width = 400;
    }
    height = Math.round(width / ratio);

    dimensionProps = {
      width,
      height,
    };
  }
  return (
    <NextImage
      src={url}
      title={title}
      alt={title}
      layout="responsive"
      {...dimensionProps}
    />
  );
};

const Debug = ({ name, ...props }) => (
  <div>
    <h3>{name}</h3>
    <pre>{JSON.stringify(props, null, 2)}</pre>
  </div>
);

const Video = ({ webasset, ...props }) => {
  return (
    <video controls>
      <source src={webasset.url} type={webasset.mimeType} />;
    </video>
  );
};
const Audio = ({ webasset, ...props }) => (
  <audio controls src={webasset.url}>
    Your browser does not support the
    <code>audio</code> element.
  </audio>
);

const ArchiveFile = ({ mimeType, webassets, ...props }) => {
  // console.log(mimeType, props);
  const type = mimeType.split("/")[0];
  const webasset = getWebassetForType(type, webassets);
  const imageWebasset = getWebassetForType("image", webassets);
  console.log(type, webassets);

  if (webasset === undefined) {
    console.warn(
      `No webasset found for type  ${type} in ${webassets
        .map((wa) => wa.mimeType)
        .join(",")}`
    );
    return null;
  }

  switch (type) {
    case "video":
      return <Video webasset={webasset} />;
    case "audio":
      return <Audio webasset={webasset} />;
    case "image":
      return <Image {...webasset} />;
    default:
      return <Debug name={`unknown: ${type}`} {...props} />;
  }
};

export default ArchiveFile;
