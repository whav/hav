import { useRouter } from "next/router";

const CollectionHome = (props) => {
  const router = useRouter();
  const { collection_slug } = router.query;

  return <h1>Single Collection Page: {collection_slug}</h1>;
};

export default CollectionHome;
