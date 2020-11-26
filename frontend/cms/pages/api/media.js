import { query } from "lib/graphql";

export default async (req, res) => {
  const { mediaId } = req.query;

  const result = await query(
    `
      query MediaQuery($mediaId: String!) {
        media(id: $mediaId) {
          title
          license {
            name
            shortName
            href
            logo
          }
          collection {
            name
            shortName
            slug
          }
          ancestors {
            name
            id
          }
          creators {
            firstName
            lastName
            id
          }
          creationTimeframe
          tags {
            name
            source {
              source
              sourceRef
            }
          }
          src
          srcset
          height
          width

        }
      }
  `,
    {
      mediaId,
    }
  );

  res.status = 200;
  res.json(result);
};
