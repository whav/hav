import { bundleMDX } from "mdx-bundler";

const bundle = async (body) => {
  const result = await bundleMDX(body);
  const { code, frontmatter } = result;
  return code;
};

export default bundle;
