import { useAPI } from "hooks";
import Link from "next/link";

const ImageMedia = ({ media, sizes, width }) => {
  return (
    <img
      alt={media.title}
      sizes={sizes}
      width={width}
      src={media.thumbnailUrl}
      srcSet={media.srcset.join(", ")}
    />
  );
};

const MediaSwitch = (data, props) => {
  return <ImageMedia {...data} {...props.sizes} {...props.width} />;
};

const Media = (props) => {
  const { id, caption, sizes, width, link = true } = props;
  const { data } = useAPI("/api/media/", { mediaId: id });
  if (!data) {
    return null;
  }

  console.log(data);
  const {
    media: {
      id: mediaId,
      collection: { slug: collectionSlug },
    },
  } = data;
  let Wrapper = ({ children }) => <>{children}</>;
  if (link) {
    const href = `/collections/${collectionSlug}/media/${mediaId}/`;
    Wrapper = ({ children }) => (
      <Link href={href}>
        <a>{children}</a>
      </Link>
    );
  }

  return (
    <Wrapper>
      <div className="max-w-sm m-4">
        {caption && <div>{caption}</div>}
        <MediaSwitch {...data} {...props} />
      </div>
    </Wrapper>
  );
};

export default Media;
