import React from "react";
import { useRouter } from "next/router";
import { useAPI } from "hooks";
import { Link, Loading } from "components";
import { Folder, Media, FileBrowser } from "components/filebrowser";
import Header from "components/filebrowser/Header";
import Head from "next/head";

const CollectionBrowser = (props) => {
  const router = useRouter();

  const { collection_slug, folder_id } = router.query;

  // conditionally fetch content if collection_slug and folder_id present
  const { data } = useAPI(collection_slug && folder_id ? `/api/sets/` : null, {
    collection: collection_slug,
    set: folder_id,
  });

  if (!data) {
    return <Loading />;
  }

  const { name = "", children = [], ancestors = [], mediaEntries = [] } = data;

  return (
    <>
      <Head>
        <title>{`${collection_slug}: ${name}`}</title>
      </Head>
      <Header
        title={name}
        collection_slug={collection_slug}
        ancestors={ancestors}
      />

      <FileBrowser>
        {children.map((c) => (
          <Link
            key={`set-${c.id}`}
            href={router.pathname}
            as={`/collections/${collection_slug}/browse/${c.id}/`}
          >
            <a>
              <Folder name={c.name} />
            </a>
          </Link>
        ))}
        {mediaEntries.map((media) => (
          <Link
            key={`media-${media.id}`}
            href={`/collections/[collection_slug]/media/[media_id]/`}
            as={`/collections/${collection_slug}/media/${media.id}/`}
          >
            <a>
              <Media {...media} />
            </a>
          </Link>
        ))}
      </FileBrowser>
      {/* <pre>{JSON.stringify({ props, data }, null, 2)}</pre> */}
    </>
  );
};

export default CollectionBrowser;
