// server side only dependencies
import fg from "fast-glob";

const getFiles = async () => {
  console.log(__dirname);
  const sourceDirectory = __dirname;

  let files = await fg(["**/*.{md,mdx}"], { cwd: sourceDirectory });
  return files;
};

export { getFiles };
