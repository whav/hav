import React from "react";
import { FolderIcon, SoundIcon, VideoIcon, ImageIcon } from "components/icons";

const iconMapping = {
  folder: FolderIcon,
  audio: SoundIcon,
  video: VideoIcon,
  image: ImageIcon,
};

const Gallery = ({ title, children = null, divide = false }) => {
  return (
    <div className={`mt-2 ${divide ? "sm:border-l" : "border-0"}`}>
      {title && (
        <h2 className={`inline-block text-lg text-gray-500`}>{title}</h2>
      )}
      <div className={`flex flex-row flex-wrap justify-start items-stretch`}>
        {children}
      </div>
    </div>
  );
};

const GalleryFolder = (props) => <GalleryMedia type={"folder"} {...props} />;

const GalleryMedia = ({
  src,
  title,
  caption = "",
  aspectRatio = 1,
  type = "",
}) => {
  const Icon = iconMapping[type] || null;
  return (
    <figure
      className={`p-4 rounded-sm border-transparent hover:bg-gray-100 border`}
      style={{ maxWidth: aspectRatio < 1 ? 200 : 250 }}
    >
      <img
        src={src}
        loading="lazy"
        title={title || caption}
        className="border border-gray-100"
      />
      <figcaption className="text-sm">
        {Icon ? <Icon className="inline-block" /> : null} {caption}
      </figcaption>
    </figure>
  );
};

export { Gallery, GalleryMedia, GalleryFolder };
