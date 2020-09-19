import { query } from "lib/graphql";

export default async (req, res) => {
  console.log(res.query);
  const { id } = req.query;

  const result = await query(
    `
      query MediaQuery($mediaId: String!) {
        media(id: $mediaId) {
          title
          collection {
            name
            shortName
          }
          ancestors {
            name
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
      mediaId: id,
    }
  );
  // console.log(result);
  // const { data } = result;
  res.status = 200;
  res.json(result);
};
