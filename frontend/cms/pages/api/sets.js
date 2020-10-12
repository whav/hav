import { query, gql } from "lib/graphql";

export default async (req, res) => {
  const result = await query(
    gql`
      query SetQuery($set: String!, $collection: String!) {
        node(nodeID: $set, collectionSlug: $collection) {
          name
          ancestors {
            name
            id
          }
          children {
            name
            id
          }
        }
        mediaEntries(nodeID: $set) {
          id
          title
          thumbnailUrl
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
