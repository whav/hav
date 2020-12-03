import React from "react";
import styles from "./gallery.module.css";
import { FolderIcon, SoundIcon, VideoIcon, ImageIcon } from "components/icons";

const iconMapping = {
  folder: FolderIcon,
  audio: SoundIcon,
  video: VideoIcon,
  image: ImageIcon,
};

const Gallery = ({ children = null }) => {
  return <div className={styles.gallery}>{children}</div>;
};

const GalleryFolder = (props) => <GalleryMedia type={"folder"} {...props} />;

const GalleryMedia = ({
  src,
  title,
  caption = "",
  aspectRatio = 1,
  isFolder = false,
  type = "",
}) => {
  let classNames = `${styles.figure} ${isFolder ? styles.folder : ""}`;

  const Icon = iconMapping[type] || null;

  if (aspectRatio < 1) {
    classNames = `${classNames} ${styles.portrait}`;
  }
  return (
    <figure className={classNames}>
      <img src={src} title={title || caption} />
      <figcaption>
        {Icon ? <Icon /> : null} {caption}
      </figcaption>
    </figure>
  );
};

export { Gallery, GalleryMedia, GalleryFolder };
