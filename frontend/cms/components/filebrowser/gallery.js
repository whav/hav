import React from "react";
import styles from "./gallery.module.css";
import { FolderIcon } from "components/icons";

const Gallery = ({ children = null }) => {
  return <div className={styles.gallery}>{children}</div>;
};

const GalleryFolder = ({ caption = "", ...props }) => {
  caption = (
    <>
      <FolderIcon /> {caption}
    </>
  );
  return <GalleryMedia isFolder={true} caption={caption} {...props} />;
};

const GalleryMedia = ({
  src,
  title,
  caption = "",
  aspectRatio = 1,
  isFolder = false,
}) => {
  let classNames = `${styles.figure} ${isFolder ? styles.folder : ""}`;

  if (aspectRatio < 1) {
    classNames = `${classNames} ${styles.portrait}`;
  }
  return (
    <figure className={classNames}>
      <img src={src} title={title || caption} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
};

export { Gallery, GalleryMedia, GalleryFolder };
