const fg = require("fast-glob");
const fs = require("fs");
const path = require("path");
const gqlClient = require("./client");
const gql = require("graphql-tag");

const _defaultPath = path.resolve(__dirname, "../content/collections/");

const getLocalCollections = (p = _defaultPath) => {
  const collection_directories = fs
    .readdirSync(p)
    .filter(f => fs.statSync(path.join(p, f)).isDirectory());

  let collections = {};
  collection_directories.forEach(
    directory_name =>
      (collections[directory_name] = path.join(p, directory_name))
  );
  return collections;
};

const getRemoteCollections = async () => {
  let data = await gqlClient.query({
    query: gql`
      {
        allCollections {
          name
          slug
          shortName
        }
      }
    `
  });
  return data.data.allCollections;
};

const getMergedCollections = async () => {
  const local_collections = getLocalCollections();
  const remote_locations = await getRemoteCollections();
  return remote_locations.map(c => ({
    ...c,
    filePath: local_collections[c.slug]
  }));
};

getMergedCollections().then(d => console.log(d));
