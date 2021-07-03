import React, { useState } from "react";
import Breadcrumbs from "../navigation/breadcrumbs";
import { Link } from "components";
import { HeaderSearchBar } from "components/search";

const HeaderBar = ({ title = "", children }) => {
  return (
    <div className="flex justify-between md:mt-8">
      <h1 className="text-xl font-bold">{title}</h1>
      <div>{children}</div>
    </div>
  );
};

const Header = ({
  title,
  collection,
  collection_slug,
  ancestors = [],
  folder_id,
  search = true,
}) => {
  return (
    <>
      <div className="flex justify-between md:h-20 md:items-end">
        <Breadcrumbs>
          <Link key="home" href="/">
            <a>Collections</a>
          </Link>
          {collection ? (
            <Link
              key="collection-root"
              href={`/collections/${collection_slug}/`}
            >
              <a>{collection.shortName}</a>
            </Link>
          ) : null}
          {ancestors.map((a) => (
            <Link
              key={`set-${a.id}`}
              href={`/collections/${collection_slug}/browse/${a.id}/`}
            >
              <a>{a.name}</a>
            </Link>
          ))}
        </Breadcrumbs>
        {search ? (
          <HeaderSearchBar
            target={`/collections/${collection_slug}/search/`}
            node={folder_id}
          />
        ) : null}
      </div>

      <HeaderBar title={title}></HeaderBar>
    </>
  );
};

export { Header, HeaderBar };
