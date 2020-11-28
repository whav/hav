import React from "react";
import { default as NextImage } from "next/image";

const Image = ({ src, title, height, width }) => {
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
  return <NextImage src={src} title={title} alt={title} {...dimensionProps} />;
};

export default Image;
