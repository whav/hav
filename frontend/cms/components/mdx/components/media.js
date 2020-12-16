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
    <div className="flex">
      <div className="max-w-sm">
        <MediaSwitch {...data} />
        {caption && <Text>{caption}</Text>}
      </div>
    </div>
  );
};

export default Media;
