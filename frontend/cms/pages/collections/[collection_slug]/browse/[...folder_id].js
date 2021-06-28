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
import groupBy from "lodash/groupBy";
import { FallbackMedia } from "components/shared/fallback";

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
    collection = {},
  } = data;

  // initial grouping: all media entries in one (empty) key
  let groupedMedia = { "": mediaEntries };

  // check if all media entries have a grouper attribute
  const isGrouped = mediaEntries.every((m) => m.grouper);
  // TODO: find a better way to remove captions
  let displayMediaCaption = true;

  // and if so, group by it
  if (isGrouped) {
    groupedMedia = groupBy(mediaEntries, (m) => m.grouper);
    displayMediaCaption = !mediaEntries.every(
      (ma) => ma.caption === ma.grouper
    );
  }

  return (
    <>
      <Head>
        <title>{`${collection_slug}: ${name}`}</title>
      </Head>
      <Header
        title={name}
        collection={collection}
        collection_slug={collection_slug}
        ancestors={ancestors}
        folder_id={folder_id}
      />

      <Description text={description} />
      <TagList tags={tags} />
      <Gallery>
        {children.map((c) => {
          const media = c.representativeMedia || FallbackMedia;
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
      </Gallery>

      {Object.entries(groupedMedia).map(([title, mediaItems], index) => (
        <Gallery title={title} divide={isGrouped}>
          {mediaItems.map((media) => {
            return (
              <Link
                key={`media-${media.id}`}
                href={`/collections/${collection_slug}/media/${media.id}/`}
              >
                <a>
                  <GalleryMedia
                    src={media.thumbnailUrl || FallbackMedia.thumbnailUrl}
                    type={media.type}
                    title={media.title === media.grouper ? "" : media.title}
                    caption={`${media.caption}`}
                    displayCaption={displayMediaCaption}
                    aspectRatio={media.aspectRatio}
                    locked={media.locked}
                  />
                </a>
              </Link>
            );
          })}
        </Gallery>
      ))}
    </>
  );
};

export default CollectionBrowser;
