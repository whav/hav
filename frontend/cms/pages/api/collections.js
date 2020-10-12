import { query } from "lib/graphql";

export default async (req, res) => {
  const result = await query(
    `{
        collections {
        name
        slug
        shortName
        rootNode {
            id
        }
      }
    }`
  );
  res.status = 200;
  const collections = result.collections.map((c) => ({
    ...c,
    rootNode: c.rootNode?.id,
  }));
  res.json(collections);
};
