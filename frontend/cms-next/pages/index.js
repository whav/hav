import fs from "fs";
import path from "path";

import matter from "gray-matter";
import renderToString from "next-mdx-remote/render-to-string";
import hydrate from "next-mdx-remote/hydrate";

const Test = () => (
  <div>
    <h1>MDX Component!</h1>
  </div>
);

const components = { Test };

export default function TestPage({ source }) {
  const content = hydrate(source, { components });
  return <div className="wrapper">{content}</div>;
}

export async function getStaticProps() {
  const sourceDirectory = path.join(process.cwd(), "content");
  const source = fs.readFileSync(path.join(sourceDirectory, "test.mdx"));
  const { content, data } = matter(source);
  const mdxSource = await renderToString(content, { components, scope: data });
  return { props: { source: mdxSource, frontMatter: data } };
}
