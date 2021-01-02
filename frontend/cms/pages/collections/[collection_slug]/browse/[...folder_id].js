import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAPI } from "hooks";
import { Loading } from "components";
import { Description } from "components/filebrowser";
import {
  Gallery,
  GalleryMedia,
  GalleryFolder,
} from "components/filebrowser/gallery";
import { TagList } from "components/tags";
import { Header } from "components/filebrowser/Header";
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

  const {
    name = "",
    children = [],
    ancestors = [],
    mediaEntries = [],
    description = "",
    tags = [],
  } = data;

  return (
    <>
      <Head>
        <title>{`${collection_slug}: ${name}`}</title>
      </Head>
      <Header
        title={name}
        collection_slug={collection_slug}
        ancestors={ancestors}
        folder_id={folder_id}
      />

      <Description text={description} />
      <TagList tags={tags} />
      <Gallery>
        {children.map((c) => {
          const media = c.representativeMedia;
          return (
            <Link
              key={`set-${c.id}`}
              href={`/collections/${collection_slug}/browse/${c.id}/`}
            >
              <a>
                <GalleryFolder
                  caption={c.name}
                  src={media.thumbnailUrl}
                  title={media.title}
                  aspectRatio={media.aspectRatio}
                />
              </a>
            </Link>
          );
        })}
        {mediaEntries.map((media) => (
          <Link
            key={`media-${media.id}`}
            href={`/collections/${collection_slug}/media/${media.id}/`}
          >
            <a>
              <GalleryMedia
                src={media.thumbnailUrl}
                type={media.type}
                title={media.title}
                caption={`${media.caption}`}
                aspectRatio={media.aspectRatio}
              />
            </a>
          </Link>
        ))}
      </Gallery>
    </>
  );
};

export default CollectionBrowser;
