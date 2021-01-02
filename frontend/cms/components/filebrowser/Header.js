import React, { useState } from "react";
import Breadcrumbs from "../navigation/breadcrumbs";
import { Link } from "components";
import { HeaderSearchBar } from "components/search";

const HeaderBar = ({ title = "", children }) => {
  return (
    <div className="flex justify-between">
      <h1 className="text-4xl font-bold">{title}</h1>
      <div>{children}</div>
    </div>
  );
};

const Header = ({
  title,
  collection_slug,
  ancestors = [],
  folder_id,
  search = true,
}) => {
  return (
    <>
      <HeaderBar title={title}>
        {search ? (
          <HeaderSearchBar
            target={`/collections/${collection_slug}/search/`}
            node={folder_id}
          />
        ) : null}
      </HeaderBar>

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
