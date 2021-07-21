import { useAPI } from "hooks";
import Link from "next/link";
import Media from "./media";

const Folder = (props) => {
  const { id, mediaId, ...mediaProps } = props;

  const { data } = useAPI(`/api/sets/`, { set: id });

  if (!data) {
    return null;
  }

  const {
    name,
    collection: { slug },
  } = data;

  const usedMediaId = mediaId || data.representativeMedia?.id;

  return (
    <Link href={`/collections/${slug}/browse/${id}/`}>
      <a>
        <Media id={usedMediaId} caption={name} link={false} {...mediaProps} />
      </a>
    </Link>
  );
};

export default Folder;
