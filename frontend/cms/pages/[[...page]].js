import renderToString from "next-mdx-remote/render-to-string";
import hydrate from "next-mdx-remote/hydrate";
import MDX, { components } from "../components/mdx";

// server side only dependencies
import { promises as fs } from "fs";
import path from "path";
import fg from "fast-glob";
import matter from "gray-matter";

export default function ContentPage({ source, frontmatter }) {
  const content = hydrate(source, { components });
  return <div>{content}</div>;
}

export async function getStaticProps({ params: { page = [] } }) {
  const sourceDirectory = path.join(process.cwd(), "./content/");
  const pathNoExt = page.join(path.sep) || ".";
  const files = await fg(
    [`${pathNoExt}/index.{md,mdx}`, `${pathNoExt}.{md,mdx}`],
    {
      cwd: sourceDirectory,
    }
  );
  // sort by length => urxn/index.md beats urxn.md
  files.sort((a, b) => b.length - a.length);

  const mdFile = path.join(sourceDirectory, files[0]);

  console.log(`Selected file: ${mdFile}`);
  const source = await fs.readFile(mdFile);
  const { content, frontmatter = {} } = matter(source);
  console.log(frontmatter);
  const mdxSource = await renderToString(content, { components });
  return { props: { source: mdxSource, frontmatter } };
}

export async function getStaticPaths() {
  const sourceDirectory = path.join(process.cwd(), "./content/");

  let files = await fg(["**/*.{md,mdx}"], { cwd: sourceDirectory });

  const parts = files
    .map((rel_file) => rel_file.split(path.sep))
    .map((parts) => {
      // create a path array for usage in urls
      // e.g. filename ./a/b/c => [a,b,c]
      const filename = parts.pop();
      const basename = path.basename(filename, path.extname(filename));
      // index files are treated specially
      if (basename == "index") {
        return parts;
      }
      return [...parts, basename];
    });

  const paths = parts.map((p) => ({
    params: {
      page: [...p],
    },
  }));

  return {
    paths,
    fallback: false,
  };
}
