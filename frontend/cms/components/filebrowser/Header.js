import Breadcrumbs from "../navigation/breadcrumbs";
import { Link } from "components";

const Header = ({ title, collection_slug, ancestors = [] }) => {
  return (
    <>
      <h1>{title}</h1>
      <Breadcrumbs>
        {ancestors.map((a) => (
          <Link
            key={`set-${a.id}`}
            href={`/collections/${collection_slug}/browse/${a.id}/`}
          >
            <a>{a.name}</a>
          </Link>
        ))}
      </Breadcrumbs>
    </>
  );
};

export default Header;
