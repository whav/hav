import Breadcrumbs from "../navigation/breadcrumbs";
import { Link } from "components";

const HeaderBar = ({ title = "", search = true }) => {
  return (
    <div className="flex justify-between">
      <h1 className="text-4xl font-bold">{title}</h1>
      {search ? (
        <div className="hidden md:block">
          <input
            type="search"
            disabled
            className="shadow rounded border-0 p-3"
            placeholder="Search"
          />
        </div>
      ) : null}
    </div>
  );
};

const Header = ({ title, collection_slug, ancestors = [], search = true }) => {
  return (
    <>
      <HeaderBar title={title} search={search} />

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

export { Header, HeaderBar };
