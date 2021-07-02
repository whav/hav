import { useAPI } from "hooks";

const ImageMedia = ({ media, caption, title, url }) => {
  return (
    <img
      alt={media.title}
      src={media.thumbnailUrl}
      srcSet={media.srcset.join(", ")}
    />
  );
};

const MediaSwitch = (props) => {
  return <ImageMedia {...props} />;
};

const Media = (props) => {
  const { id, caption } = props;
  const { data } = useAPI("/api/media/", { mediaId: id });
  if (!data) {
    return null;
  }

  return (
      <div className="max-w-sm m-4">
        {caption && <div>{caption}</div>}
        <MediaSwitch {...data} />
      </div>
  );
};

export default Media;
