import { query } from "lib/graphql";

export default async (req, res) => {
  const collections = await getAllCollections();
  res.status = 200;
  res.json(collections);
};

export const getAllCollections = async () => {
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

  const collections = result.collections.map((c) => ({
    ...c,
    rootNode: c.rootNode?.id,
  }));
  return collections;
};

export const getCollectionBySlug = async (slug) => {
  const collections = await getAllCollections();
  return collections.find((c) => c.slug === slug);
};
