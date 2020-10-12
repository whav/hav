import { query } from "lib/graphql";

export default async (req, res) => {
  // console.log(res.query);
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
          srcset
          thumbnailUrl
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
