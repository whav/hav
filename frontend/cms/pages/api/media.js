import { query } from "lib/graphql";

export default async (req, res) => {
  const { mediaId } = req.query;

  const result = await query(
    `
      query MediaQuery($mediaId: String!) {
        media(id: $mediaId) {
          id
          title
          description
          originalMediaType {
            name
          }
          originalMediaDescription
          originalMediaIdentifier
          embargoEndDate
          isPrivate
          coordsLat
          coordsLon
          createdAt
          modifiedAt
          height
          width
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
          creationTimeframeResolution
          tags {
            id
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
          files {
            id
            originalFilename
            mimeType
            webassets {
              mimeType
              url
              width
              height
            }
        }
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
