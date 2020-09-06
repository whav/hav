import { query } from "lib/graphql";

export default async (req, res) => {
  const result = await query(`
      {
        media(id: "935") {
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
        }
      }
  `);
  console.log(result);
  const { data } = result;
  res.status = 200;
  res.json(data);
};
