import Breadcrumbs from "../navigation/breadcrumbs";
import { Link } from "components";

const Header = ({ title, collection_slug, ancestors = [] }) => {
  return (
    <>
      <h1 className="font-bold">{title}</h1>
      <div className="py-4">
        <Breadcrumbs>
          {ancestors.map((a) => (
            <Link
              key={`set-${a.id}`}
              href={`/collections/${collection_slug}/browse/${a.id}/`}
            >
              <a className="text-blue-500">{a.name}</a>
            </Link>
          ))}
        </Breadcrumbs>
      </div>
    </>
  );
};

export default Header;
