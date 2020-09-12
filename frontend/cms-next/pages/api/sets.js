import { query, gql } from "lib/graphql";

export default async (req, res) => {
  console.warn("Query", req.query);
  const { set, collection } = req.query;
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
      }
    `,
    req.query
  );
  //   console.log(result);
  // const { data } = result;
  res.status = 200;
  res.json(result);
};
