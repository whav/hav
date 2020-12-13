import React from "react";
import { FolderIcon, SoundIcon, VideoIcon, ImageIcon } from "components/icons";

const iconMapping = {
  folder: FolderIcon,
  audio: SoundIcon,
  video: VideoIcon,
  image: ImageIcon,
};

const Gallery = ({ children = null }) => {
  return (
    <div className="flex flex-row flex-wrap items-baseline justify-start">
      {children}
    </div>
  );
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
  const Icon = iconMapping[type] || null;

  return (
    <figure className="pr-4 pb-6" style={{ maxWidth: 230 }}>
      <img src={src} title={title || caption} />
      <figcaption>
        {Icon ? <Icon /> : null} {caption}
      </figcaption>
    </figure>
  );
};

export { Gallery, GalleryMedia, GalleryFolder };
