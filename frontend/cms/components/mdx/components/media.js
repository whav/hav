import { useAPI } from "hooks";

const ImageMedia = ({ media, sizes }) => {
  return (
    <img
      alt={media.title}
      sizes={sizes}
      src={media.thumbnailUrl}
      srcSet={media.srcset.join(", ")}
    />
  );
};

const MediaSwitch = (data, props) => {
  return <ImageMedia {...data} {...props.sizes} />;
};

const Media = (props) => {
  const { id, caption, sizes } = props;
  const { data } = useAPI("/api/media/", { mediaId: id });
  if (!data) {
    return null;
  }

  return (
      <div className="max-w-sm m-4">
        {caption && <div>{caption}</div>}
        <MediaSwitch {...data} {...props} />
      </div>
  );
};

export default Media;
