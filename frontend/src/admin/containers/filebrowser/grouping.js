import groupBy from "lodash/groupBy";

const groupFiles = files => {
  return groupBy(files, f => {
    // greoup by grouping attribute
    // otherwise just use the url => no grouping
    return f.grouping || f.url;
  });
};

export default groupFiles;
