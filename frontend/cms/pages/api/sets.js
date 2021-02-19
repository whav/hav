import { query, gql } from "lib/graphql";

export default async (req, res) => {
  const result = await query(
    gql`
      query SetQuery($set: String!, $collection: String) {
        node(nodeId: $set, collectionSlug: $collection) {
          name
          description
          tags {
            id
            name
          }
          ancestors {
            name
            id
          }
          children {
            name
            id
            representativeMedia {
              title: originalMediaIdentifier
              thumbnailUrl
              aspectRatio
            }
          }
          collection {
            id
            slug
            name
          }
        }
        mediaEntries(nodeId: $set) {
          id
          caption: title
          title: originalMediaIdentifier
          thumbnailUrl
          aspectRatio
          type
        }
      }
    `,
    req.query
  );

  const data = {
    ...result.node,
    mediaEntries: result.mediaEntries,
  };
  res.status = 200;
  res.json(data);
};
