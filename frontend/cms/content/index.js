// server side only dependencies
import fg from "fast-glob";

const getFiles = async () => {
  const sourceDirectory = __dirname;
  let files = await fg(["**/*.{md,mdx}"], { cwd: sourceDirectory });
  return files;
};

export { getFiles };
