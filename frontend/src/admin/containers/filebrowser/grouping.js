import groupBy from "lodash/groupBy";

const groupFiles = files => {
  return groupBy(files, "grouping");
};

export default groupFiles;
