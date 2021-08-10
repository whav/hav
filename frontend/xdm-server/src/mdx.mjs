import { bundleMDX } from "mdx-bundler";

const bundle = async (body) => {
    console.log('Body', body);
  const result = await bundleMDX(body, {
      esbuildOptions(options) {
          options.minify = false;
          options.target = [
            'es2020',
              ];
          return options;
      }
      }
  );
  const { code, frontmatter } = result;
  return code;
};

export default bundle;
