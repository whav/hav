import React from "react";
import { default as NextImage } from "next/image";

const Image = ({ src, title, height, width }) => {
  let dimensionProps = {
    unsized: true,
  };
  if (width && height) {
    const ratio = width / height;
    const base = 800;
    if (width > height) {
      width = base;
      height = Math.round(base / ratio);
    } else {
      height = 500;
      width = Math.round(base / ratio);
    }

    dimensionProps = {
      width,
      height,
    };
  }
  return <NextImage src={src} title={title} alt={title} {...dimensionProps} />;
};

export default Image;
