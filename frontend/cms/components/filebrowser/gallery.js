import React from "react";
import {
  FolderIcon,
  SoundIcon,
  VideoIcon,
  ImageIcon,
  QuestionMarkIcon,
  LockIcon,
} from "components/icons";

const iconMapping = {
  folder: FolderIcon,
  audio: SoundIcon,
  video: VideoIcon,
  image: ImageIcon,
};

const GalleryItemIconList = ({ children }) => {
  return (
    <div className={`absolute top-0 left-0 flex flex-row`}>
      {React.Children.map(children, (child, index) => {
        console.log(child);
        return child ? (
          <div
            key={index}
            className={`bg-gray-100 bg-opacity-90 rounded-full p-1 transform -translate-x-1/4 -translate-y-1/4 border border-gray-100`}
          >
            {child}
          </div>
        ) : null;
      })}
    </div>
  );
};

const Gallery = ({ title, children = null, divide = false }) => {
  return (
    <div className={`mt-2 -mx-4`}>
      {title && <h2 className={`inline-block text-lg font-bold`}>{title}</h2>}
      <div className={`gallery flex flex-row flex-wrap justify-start items-stretch`}>
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
  displayCaption = true,
  locked = false,
}) => {
  const Icon = iconMapping[type] || QuestionMarkIcon;
  return (
    <figure
      className={`p-4 rounded-sm border-transparent hover:bg-gray-100 border`}
      style={{ width: Math.sqrt(48000 * aspectRatio) }}
    >
      <div className={`relative`}>
        <img
          src={src}
          loading="lazy"
          title={title || caption}
          className="border border-gray-100"
        />

        <GalleryItemIconList>
          <Icon />
          {locked ? <LockIcon /> : null}
        </GalleryItemIconList>
      </div>

      <figcaption className="text-sm">
        {displayCaption ? caption : null}
      </figcaption>
    </figure>
  );
};

export { Gallery, GalleryMedia, GalleryFolder };
