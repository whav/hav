import { useAPI } from "hooks";
import Link from "next/link";

const Folder = (props) => {
  const { id } = props;

  const { data } = useAPI("/api/sets/", { set: id });
  if (!data) {
    return null;
  }
  const {
    name,
    collection: { slug },
  } = data;
  return <Link href={`/collections/${slug}/browse/${id}/`}>{data.name}</Link>;
};

export default Folder;
